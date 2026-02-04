import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/UI/Button';
import { ScoreDisplay } from '../../components/Game/ScoreDisplay';
import { ProgressChart } from '../../components/Stats/ProgressChart';
import { SessionHistory } from '../../components/Stats/SessionHistory';
import { PitchMeter } from '../../components/Game/PitchMeter';
import { SessionSetup, SESSION_INSTRUMENTS } from '../../components/Game/SessionSetup';
import { usePitchGameState } from '../../hooks/usePitchGameState';
import { usePitchDetector } from '../../hooks/usePitchDetector';
import { useAudio } from '../../hooks/useAudio';
import { PITCH_LEVELS } from '../../utils/constants';
import { frequencyToNoteData } from '../../utils/intervals';

type PitchView = 'training' | 'stats';

interface PitchExerciseProps {
  onBack?: () => void;
}

const TOLERANCE_CENTS = 25;
const NOTE_DURATION_SECONDS = 1.1;
const LISTEN_START_DELAY_MS = 1200;
const HOLD_DURATION_MS = 1000;
const MAX_ATTEMPT_MS = 30000;

export function PitchExercise({ onBack }: PitchExerciseProps) {
  const [currentView, setCurrentView] = useState<PitchView>('training');
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

  const handleStartGame = () => {
    actions.startGame(state.selectedLevel, state.selectedInstrument);
  };

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

  const handleNextQuestion = () => {
    autoPlayNextRef.current = true;
    actions.nextQuestion();
  };

  const handleEndGame = () => {
    stopListening();
    actions.endGame();
  };

  const handleBack = () => {
    stopListening();
    onBack?.();
  };

  useEffect(() => {
    if (!currentQuestion || state.showResult) return;
    if (autoPlayNextRef.current) {
      autoPlayNextRef.current = false;
      handlePlayNote();
    }
  }, [currentQuestion?.id, state.showResult]);

  const renderTrainingView = () => {
    const session = state.currentSession;

    if (!session) {
      const level = PITCH_LEVELS.find(l => l.id === state.selectedLevel) ?? PITCH_LEVELS[0];
      const detailItems = [
        `${level.notes.length} notes`,
        `Notes: ${level.notes.join(', ')}`,
        `Octave range: ${level.octaveRange[0]}-${level.octaveRange[1]}`,
      ];
      return (
        <div className="space-y-4">
          <SessionSetup
            title="Build your round"
            levels={PITCH_LEVELS}
            selectedLevel={state.selectedLevel}
            onLevelChange={actions.setLevel}
            instruments={SESSION_INSTRUMENTS}
            selectedInstrument={state.selectedInstrument}
            onInstrumentChange={actions.setInstrument}
            instrumentTitle="Playback instrument"
            detailItems={detailItems}
            onStart={handleStartGame}
            disabled={!isInitialized}
          />

          {!isInitialized && (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-center">
              <p className="text-amber-200">Audio engine loading...</p>
            </div>
          )}
        </div>
      );
    }

    if (computed.isGameComplete) {
      const correctAnswers = session.answers.filter(a => a.isCorrect).length;
      const accuracy = (correctAnswers / session.answers.length) * 100;
      const averageTime = session.answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / session.answers.length;

      return (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
          <h2 className="text-3xl font-semibold mb-6 text-emerald-300">Session complete</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4">
              <p className="text-2xl font-semibold text-emerald-300">{correctAnswers}/10</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Correct</p>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4">
              <p className="text-2xl font-semibold text-cyan-300">{accuracy.toFixed(1)}%</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Accuracy</p>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4">
              <p className="text-2xl font-semibold text-amber-300">{(averageTime / 1000).toFixed(1)}s</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Avg Time</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleStartGame} variant="primary" size="lg" className="w-full md:w-auto">
              Sing Again
            </Button>
            <Button onClick={handleEndGame} variant="secondary" size="lg" className="w-full md:w-auto ml-0 md:ml-3">
              Back to Menu
            </Button>
          </div>
        </div>
      );
    }

    const answerForQuestion = session.answers[state.currentQuestionIndex];
    const inTune = typeof centsOff === 'number' && Math.abs(centsOff) <= TOLERANCE_CENTS;
    const timeRemaining = attemptStartTime !== null
      ? Math.max(0, MAX_ATTEMPT_MS - elapsedMs)
      : MAX_ATTEMPT_MS;

    return (
      <div className="space-y-4">
        <ScoreDisplay
          answers={session.answers}
          totalQuestions={session.questions.length}
          currentQuestionIndex={state.currentQuestionIndex}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Target</p>
                <p className="text-3xl font-semibold text-slate-100">{targetLabel}</p>
              </div>
              <Button
                onClick={handlePlayNote}
                variant="primary"
                size="lg"
                disabled={!isInitialized || state.showResult}
              >
                {attemptStartTime === null ? 'Play' : 'Replay'}
              </Button>
            </div>

            <div className="space-y-2 text-sm text-slate-400">
              <p>Microphone: <span className="font-medium capitalize text-slate-200">{micStatusLabel}</span></p>
              {errorMessage && <p className="text-rose-300">{errorMessage}</p>}
              {attemptStartTime !== null && !state.showResult && (
                <p className="text-xs text-slate-500">
                  Time remaining: {(timeRemaining / 1000).toFixed(1)}s
                </p>
              )}
            </div>

            {state.showResult && currentQuestion && (
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 text-center">
                {answerForQuestion?.isCorrect ? (
                  <div className="text-emerald-300">
                    <h3 className="text-lg font-semibold mb-1">Locked</h3>
                    <p className="text-slate-300">Within {TOLERANCE_CENTS} cents of {targetLabel}.</p>
                  </div>
                ) : (
                  <div className="text-rose-300">
                    <h3 className="text-lg font-semibold mb-1">Missed</h3>
                    <p className="text-slate-300">Best match: {bestMatchText}.</p>
                  </div>
                )}

                {state.currentQuestionIndex < session.questions.length - 1 ? (
                  <Button onClick={handleNextQuestion} variant="primary" size="lg" className="mt-4 w-full">
                    Next Question →
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} variant="success" size="lg" className="mt-4 w-full">
                    Finish Session
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Pitch meter</span>
              <span className={inTune ? 'text-emerald-300 font-semibold' : 'text-slate-500'}>
                {inTune ? 'Locked' : 'Tracking'}
              </span>
            </div>

            <PitchMeter
              centsOff={centsOff}
              clarity={clarity}
              isActive={status === 'listening' && !isPaused}
              targetNote={currentQuestion?.targetNote ?? null}
            />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
                <p className="text-slate-400">Your pitch</p>
                <p className="font-semibold text-slate-100">
                  {detectedNote?.note ? `${detectedNote.note.note}${detectedNote.note.octave}` : '—'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
                <p className="text-slate-400">Offset</p>
                <p className="font-semibold text-slate-100">
                  {typeof centsOff === 'number' ? `${centsOff.toFixed(1)} cents` : '—'}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Signal strength: {signalStrength}%
            </div>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/90 to-teal-500/80 text-lg font-semibold text-slate-950">
            P
          </div>
          <h2 className="text-2xl font-semibold">Pitch Match</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentView('training')}
              variant={currentView === 'training' ? 'primary' : 'secondary'}
            >
              Training
            </Button>
            <Button
              onClick={() => setCurrentView('stats')}
              variant={currentView === 'stats' ? 'primary' : 'secondary'}
            >
              Progress
            </Button>
          </div>

          {onBack && (
            <Button
              onClick={handleBack}
              variant="secondary"
              className="h-10 w-10 rounded-full p-0 border border-slate-700/80 bg-slate-900/70 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
              aria-label="Back to exercises"
            >
              &larr;
            </Button>
          )}
        </div>
      </div>

      {currentView === 'training' ? (
        renderTrainingView()
      ) : (
        <div className="space-y-6">
          <ProgressChart exerciseType="pitch" levels={PITCH_LEVELS} />
          <SessionHistory exerciseType="pitch" levels={PITCH_LEVELS} />
        </div>
      )}
    </div>
  );
}
