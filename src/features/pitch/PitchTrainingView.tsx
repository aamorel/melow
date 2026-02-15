import type { Instrument } from '../../types/game';
import type { PitchAnswer, PitchQuestion, PitchSession } from '../../types/pitch';
import { ScoreDisplay } from '../../components/Game/ScoreDisplay';
import { PitchMeter } from '../../components/Game/PitchMeter';
import { SessionSetup, SESSION_INSTRUMENTS } from '../../components/Game/SessionSetup';
import { SessionCompleteCard } from '../../components/Game/SessionCompleteCard';
import { Button } from '../../components/UI/Button';
import { PITCH_LEVELS } from '../../utils/constants';

type DetectedNoteData = {
  midi: number;
  cents: number;
  note: {
    note: string;
    octave: number;
    frequency: number;
  };
} | null;

interface SessionSummary {
  correctAnswers: number;
  totalQuestions: number;
  accuracyPercent: number;
  averageTimeMs: number;
}

interface PitchTrainingViewProps {
  isInitialized: boolean;
  session: PitchSession | null;
  selectedLevel: number;
  selectedInstrument: Instrument;
  onLevelChange: (level: number) => void;
  onInstrumentChange: (instrument: Instrument) => void;
  onStartGame: () => void;
  onEndGame: () => void;
  isGameComplete: boolean;
  currentQuestion: PitchQuestion | null;
  showResult: boolean;
  currentQuestionIndex: number;
  answers: PitchAnswer[];
  totalQuestions: number;
  onPlayNote: () => void;
  onNextQuestion: () => void;
  targetLabel: string;
  micStatusLabel: string;
  errorMessage: string | null;
  attemptStartTime: number | null;
  timeRemainingMs: number;
  inTune: boolean;
  centsOff: number | null;
  clarity: number;
  isPitchActive: boolean;
  detectedNote: DetectedNoteData;
  signalStrength: number;
  bestMatchText: string;
  toleranceCents: number;
  sessionSummary: SessionSummary | null;
}

export function PitchTrainingView({
  isInitialized,
  session,
  selectedLevel,
  selectedInstrument,
  onLevelChange,
  onInstrumentChange,
  onStartGame,
  onEndGame,
  isGameComplete,
  currentQuestion,
  showResult,
  currentQuestionIndex,
  answers,
  totalQuestions,
  onPlayNote,
  onNextQuestion,
  targetLabel,
  micStatusLabel,
  errorMessage,
  attemptStartTime,
  timeRemainingMs,
  inTune,
  centsOff,
  clarity,
  isPitchActive,
  detectedNote,
  signalStrength,
  bestMatchText,
  toleranceCents,
  sessionSummary,
}: PitchTrainingViewProps) {
  if (!session) {
    const level = PITCH_LEVELS.find(l => l.id === selectedLevel) ?? PITCH_LEVELS[0];
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
          selectedLevel={selectedLevel}
          onLevelChange={onLevelChange}
          instruments={SESSION_INSTRUMENTS}
          selectedInstrument={selectedInstrument}
          onInstrumentChange={onInstrumentChange}
          instrumentTitle="Playback instrument"
          detailItems={detailItems}
          onStart={onStartGame}
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

  if (isGameComplete && sessionSummary) {
    return (
      <SessionCompleteCard
        correctAnswers={sessionSummary.correctAnswers}
        totalQuestions={sessionSummary.totalQuestions}
        accuracyPercent={sessionSummary.accuracyPercent}
        averageTimeMs={sessionSummary.averageTimeMs}
        primaryLabel="Sing Again"
        secondaryLabel="Back to Menu"
        onPrimaryAction={onStartGame}
        onSecondaryAction={onEndGame}
      />
    );
  }

  const answerForQuestion = answers[currentQuestionIndex];
  const playLabel = attemptStartTime === null ? 'Play' : 'Replay';

  return (
    <div className="space-y-4">
      <ScoreDisplay
        answers={answers}
        totalQuestions={totalQuestions}
        currentQuestionIndex={currentQuestionIndex}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Target</p>
              <p className="text-3xl font-semibold text-slate-100">{targetLabel}</p>
            </div>
            <Button
              onClick={onPlayNote}
              variant="primary"
              size="lg"
              disabled={!isInitialized || showResult}
            >
              {playLabel}
            </Button>
          </div>

          <div className="space-y-2 text-sm text-slate-400">
            <p>
              Microphone: <span className="font-medium capitalize text-slate-200">{micStatusLabel}</span>
            </p>
            {errorMessage && <p className="text-rose-300">{errorMessage}</p>}
            {attemptStartTime !== null && !showResult && (
              <p className="text-xs text-slate-500">
                Time remaining: {(timeRemainingMs / 1000).toFixed(1)}s
              </p>
            )}
          </div>

          {showResult && currentQuestion && (
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 text-center">
              {answerForQuestion?.isCorrect ? (
                <div className="text-emerald-300">
                  <h3 className="mb-1 text-lg font-semibold">Locked</h3>
                  <p className="text-slate-300">Within {toleranceCents} cents of {targetLabel}.</p>
                </div>
              ) : (
                <div className="text-rose-300">
                  <h3 className="mb-1 text-lg font-semibold">Missed</h3>
                  <p className="text-slate-300">Best match: {bestMatchText}.</p>
                </div>
              )}

              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button onClick={onNextQuestion} variant="primary" size="lg" className="mt-4 w-full">
                  Next Question →
                </Button>
              ) : (
                <Button onClick={onNextQuestion} variant="success" size="lg" className="mt-4 w-full">
                  Finish Session
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Pitch meter</span>
            <span className={inTune ? 'text-emerald-300 font-semibold' : 'text-slate-500'}>
              {inTune ? 'Locked' : 'Tracking'}
            </span>
          </div>

          <PitchMeter
            centsOff={centsOff}
            clarity={clarity}
            isActive={isPitchActive}
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
}
