import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProgressChart } from '../../components/Stats/ProgressChart';
import { SessionHistory } from '../../components/Stats/SessionHistory';
import { ExerciseHeader, ExerciseView } from '../../components/UI/ExerciseHeader';
import { usePitchGameState } from '../../hooks/usePitchGameState';
import { usePitchDetector } from '../../hooks/usePitchDetector';
import { useAudio } from '../../hooks/useAudio';
import { PITCH_LEVELS } from '../../utils/constants';
import { frequencyToNoteData } from '../../utils/intervals';
import { PitchTrainingView } from './PitchTrainingView';
interface PitchExerciseProps {
  onBack?: () => void;
}
const TOLERANCE_CENTS = 25;
const NOTE_DURATION_SECONDS = 1.1;
const LISTEN_START_DELAY_MS = 1200;
const HOLD_DURATION_MS = 1000;
const MAX_ATTEMPT_MS = 30000;
export function PitchExercise({ onBack }: PitchExerciseProps) {
  const [currentView, setCurrentView] = useState<ExerciseView>('training');
  const { state, actions, computed } = usePitchGameState();
  const { isInitialized, playNote } = useAudio();
  const {
    status,
    errorMessage,
    frequency,
    clarity,
    rms,
    isPaused,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
  } = usePitchDetector();
  const currentQuestion = computed.currentQuestion;
  const targetFrequency = currentQuestion?.targetNote.frequency ?? null;
  const targetLabel = currentQuestion ? `${currentQuestion.targetNote.note}${currentQuestion.targetNote.octave}` : '—';
  const centsOff = useMemo(() => {
    if (!frequency || !targetFrequency) return null;
    return 1200 * Math.log2(frequency / targetFrequency);
  }, [frequency, targetFrequency]);
  const detectedNote = useMemo(() => {
    if (!frequency) return null;
    return frequencyToNoteData(frequency);
  }, [frequency]);
  const [attemptStartTime, setAttemptStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [bestCentsOff, setBestCentsOff] = useState<number | null>(null);
  const bestRef = useRef<{ centsOff: number | null; frequency: number | null }>({
    centsOff: null,
    frequency: null,
  });
  const attemptStartRef = useRef<number | null>(null);
  const inTuneStartRef = useRef<number | null>(null);
  const failTimeoutRef = useRef<number | null>(null);
  const listenTimeoutRef = useRef<number | null>(null);
  const autoSubmitRef = useRef(false);
  const autoPlayNextRef = useRef(false);
  const signalStrength = useMemo(() => {
    const minRms = 0.002;
    const maxRms = 0.05;
    const normalized = Math.max(0, Math.min(1, (rms - minRms) / (maxRms - minRms)));
    const eased = Math.log1p(normalized * 9) / Math.log1p(9);
    return Math.round(eased * 100);
  }, [rms]);
  const micStatusLabel = status === 'listening' && isPaused ? 'paused' : status;
  const bestMatchText = useMemo(() => {
    if (bestCentsOff === null) return 'no clear pitch';
    const direction = bestCentsOff === 0 ? 'on' : bestCentsOff < 0 ? 'below' : 'above';
    const amount = Math.abs(bestCentsOff).toFixed(1);
    if (bestCentsOff === 0) {
      return `right on the target note (${targetLabel})`;
    }
    return `${amount} cents ${direction} the target note (${targetLabel})`;
  }, [bestCentsOff, targetLabel]);
  const inTune = typeof centsOff === 'number' && Math.abs(centsOff) <= TOLERANCE_CENTS;
  const timeRemainingMs = attemptStartTime !== null
    ? Math.max(0, MAX_ATTEMPT_MS - elapsedMs)
    : MAX_ATTEMPT_MS;
  const sessionSummary = useMemo(() => {
    if (!state.currentSession || !computed.isGameComplete) return null;
    const correctAnswers = state.currentSession.answers.filter(a => a.isCorrect).length;
    const accuracyPercent = (correctAnswers / state.currentSession.answers.length) * 100;
    const averageTimeMs = state.currentSession.answers.reduce((sum, a) => sum + a.responseTimeMs, 0)
      / state.currentSession.answers.length;
    return {
      correctAnswers,
      totalQuestions: state.currentSession.answers.length,
      accuracyPercent,
      averageTimeMs,
    };
  }, [computed.isGameComplete, state.currentSession]);
  useEffect(() => {
    if (currentQuestion) {
      setAttemptStartTime(null);
      attemptStartRef.current = null;
      setElapsedMs(0);
      bestRef.current = { centsOff: null, frequency: null };
      setBestCentsOff(null);
      inTuneStartRef.current = null;
      autoSubmitRef.current = false;
      if (failTimeoutRef.current !== null) {
        window.clearTimeout(failTimeoutRef.current);
        failTimeoutRef.current = null;
      }
      if (listenTimeoutRef.current !== null) {
        window.clearTimeout(listenTimeoutRef.current);
        listenTimeoutRef.current = null;
      }
      stopListening();
    } else {
      setAttemptStartTime(null);
    }
  }, [currentQuestion?.id, stopListening]);

  useEffect(() => {
    if (computed.isGameComplete) {
      stopListening();
    }
  }, [computed.isGameComplete, stopListening]);

  useEffect(() => {
    if (state.showResult || attemptStartTime === null || centsOff === null || frequency === null) return;
    const currentBest = bestRef.current.centsOff;
    if (currentBest === null || Math.abs(centsOff) < Math.abs(currentBest)) {
      bestRef.current = { centsOff, frequency };
      setBestCentsOff(centsOff);
    }
  }, [attemptStartTime, centsOff, frequency, state.showResult]);

  useEffect(() => {
    if (attemptStartTime === null || state.showResult) {
      setElapsedMs(0);
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedMs(Date.now() - attemptStartTime);
    }, 200);

    return () => window.clearInterval(interval);
  }, [attemptStartTime, state.showResult]);

  useEffect(() => {
    return () => {
      if (failTimeoutRef.current !== null) {
        window.clearTimeout(failTimeoutRef.current);
        failTimeoutRef.current = null;
      }
      if (listenTimeoutRef.current !== null) {
        window.clearTimeout(listenTimeoutRef.current);
        listenTimeoutRef.current = null;
      }
    };
  }, []);

  const handleStartGame = () => actions.startGame(state.selectedLevel, state.selectedInstrument);

  const submitAttempt = useCallback((isCorrect: boolean) => {
    if (attemptStartRef.current === null || autoSubmitRef.current) return;
    autoSubmitRef.current = true;
    const responseTime = attemptStartRef.current ? Date.now() - attemptStartRef.current : 0;
    const finalFrequency = bestRef.current.frequency ?? null;
    const finalCents = bestRef.current.centsOff ?? null;
    if (failTimeoutRef.current !== null) {
      window.clearTimeout(failTimeoutRef.current);
      failTimeoutRef.current = null;
    }
    if (listenTimeoutRef.current !== null) {
      window.clearTimeout(listenTimeoutRef.current);
      listenTimeoutRef.current = null;
    }
    actions.submitAnswer(finalFrequency, finalCents, responseTime, isCorrect);
    stopListening();
  }, [actions, stopListening]);

  useEffect(() => {
    if (attemptStartRef.current === null || state.showResult || status !== 'listening' || isPaused) {
      inTuneStartRef.current = null;
      return;
    }

    const inTune = typeof centsOff === 'number' && Math.abs(centsOff) <= TOLERANCE_CENTS;
    if (inTune) {
      if (inTuneStartRef.current === null) {
        inTuneStartRef.current = performance.now();
      } else if (performance.now() - inTuneStartRef.current >= HOLD_DURATION_MS) {
        submitAttempt(true);
      }
    } else {
      inTuneStartRef.current = null;
    }
  }, [centsOff, state.showResult, status, isPaused, submitAttempt]);

  const handlePlayNote = () => {
    if (!currentQuestion || state.showResult) return;

    if (attemptStartRef.current === null) {
      const startedAt = Date.now();
      attemptStartRef.current = startedAt;
      setAttemptStartTime(startedAt);
      inTuneStartRef.current = null;
      autoSubmitRef.current = false;
      if (failTimeoutRef.current !== null) {
        window.clearTimeout(failTimeoutRef.current);
      }
      failTimeoutRef.current = window.setTimeout(() => {
        submitAttempt(false);
      }, MAX_ATTEMPT_MS);
    }

    const shouldPause = status === 'listening';
    if (shouldPause) {
      pauseListening();
    }
    void playNote(currentQuestion.targetNote, state.selectedInstrument, NOTE_DURATION_SECONDS);
    if (listenTimeoutRef.current !== null) {
      window.clearTimeout(listenTimeoutRef.current);
    }
    listenTimeoutRef.current = window.setTimeout(() => {
      if (attemptStartRef.current !== null && !state.showResult) {
        void startListening().then(() => resumeListening());
      }
    }, LISTEN_START_DELAY_MS);
  };

  const handleNextQuestion = () => { autoPlayNextRef.current = true; actions.nextQuestion(); };

  const handleEndGame = () => { stopListening(); actions.endGame(); };

  const handleBack = () => { stopListening(); onBack?.(); };

  useEffect(() => {
    if (!currentQuestion || state.showResult) return;
    if (autoPlayNextRef.current) {
      autoPlayNextRef.current = false;
      handlePlayNote();
    }
  }, [currentQuestion?.id, state.showResult]);

  useEffect(() => {
    if (currentView === 'stats') {
      stopListening();
    }
  }, [currentView, stopListening]);

  return (
    <div className="space-y-6">
      <ExerciseHeader
        title="Pitch Match"
        icon="P"
        iconClassName="bg-gradient-to-br from-orange-300/90 to-amber-500/80"
        currentView={currentView}
        onViewChange={setCurrentView}
        onBack={handleBack}
      />

      {currentView === 'training' ? (
        <PitchTrainingView
          isInitialized={isInitialized}
          session={state.currentSession}
          selectedLevel={state.selectedLevel}
          selectedInstrument={state.selectedInstrument}
          onLevelChange={actions.setLevel}
          onInstrumentChange={actions.setInstrument}
          onStartGame={handleStartGame}
          onEndGame={handleEndGame}
          isGameComplete={computed.isGameComplete}
          currentQuestion={currentQuestion}
          showResult={state.showResult}
          currentQuestionIndex={state.currentQuestionIndex}
          answers={state.currentSession?.answers ?? []}
          totalQuestions={state.currentSession?.questions.length ?? 0}
          onPlayNote={handlePlayNote}
          onNextQuestion={handleNextQuestion}
          targetLabel={targetLabel}
          micStatusLabel={micStatusLabel}
          errorMessage={errorMessage}
          attemptStartTime={attemptStartTime}
          timeRemainingMs={timeRemainingMs}
          inTune={inTune}
          centsOff={centsOff}
          clarity={clarity}
          isPitchActive={status === 'listening' && !isPaused}
          detectedNote={detectedNote}
          signalStrength={signalStrength}
          bestMatchText={bestMatchText}
          toleranceCents={TOLERANCE_CENTS}
          sessionSummary={sessionSummary}
        />
      ) : (
        <div className="space-y-6">
          <ProgressChart exerciseType="pitch" levels={PITCH_LEVELS} />
          <SessionHistory exerciseType="pitch" levels={PITCH_LEVELS} />
        </div>
      )}
    </div>
  );
}
