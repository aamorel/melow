import { useState } from 'react';
import { ScoreDisplay } from '../../components/Game/ScoreDisplay';
import { SessionCompleteCard } from '../../components/Game/SessionCompleteCard';
import { ProgressChart } from '../../components/Stats/ProgressChart';
import { SessionHistory } from '../../components/Stats/SessionHistory';
import { ExerciseHeader, ExerciseView } from '../../components/UI/ExerciseHeader';
import { useAutoAdvanceOnResult } from '../../hooks/useAutoAdvanceOnResult';
import { useChordGameState } from '../../hooks/useChordGameState';
import { useAudio } from '../../hooks/useAudio';
import { ANSWER_FEEDBACK_TIMINGS, CHORD_LEVELS } from '../../utils/constants';
import { calculateSessionMetrics } from '../../utils/sessionMetrics';
import type { ChordQuality } from '../../types/chord';
import { ChordControls } from './ChordControls';
import { ChordPlayer } from './ChordPlayer';
import { ChordAnswerButtons } from './ChordAnswerButtons';

interface ChordExerciseProps {
  onBack?: () => void;
}

export function ChordExercise({ onBack }: ChordExerciseProps) {
  const [currentView, setCurrentView] = useState<ExerciseView>('training');
  const { state, actions, computed } = useChordGameState();
  const { isInitialized } = useAudio();
  const { nextQuestion } = actions;

  const handleStartGame = () => {
    actions.startGame(state.selectedLevel, state.selectedInstrument);
  };

  const handleAnswer = (answer: ChordQuality, responseTime: number) => {
    actions.submitAnswer(answer, responseTime);
  };

  const handleEndGame = () => {
    actions.endGame();
  };

  useAutoAdvanceOnResult({
    isActive: currentView === 'training',
    showResult: state.showResult,
    currentSession: state.currentSession,
    currentQuestionIndex: state.currentQuestionIndex,
    onNextQuestion: nextQuestion,
    timings: ANSWER_FEEDBACK_TIMINGS,
  });

  const renderTrainingView = () => {
    const session = state.currentSession;

    if (!session) {
      return (
        <ChordControls
          selectedLevel={state.selectedLevel}
          selectedInstrument={state.selectedInstrument}
          onLevelChange={actions.setLevel}
          onInstrumentChange={actions.setInstrument}
          onStartGame={handleStartGame}
          disabled={!isInitialized}
        />
      );
    }

    if (computed.isGameComplete) {
      const {
        correctAnswers,
        totalQuestions,
        accuracyPercent,
        averageTimeMs,
      } = calculateSessionMetrics(session.answers);

      return (
        <SessionCompleteCard
          correctAnswers={correctAnswers}
          totalQuestions={totalQuestions}
          accuracyPercent={accuracyPercent}
          averageTimeMs={averageTimeMs}
          primaryLabel="Play Again"
          secondaryLabel="Back to Menu"
          onPrimaryAction={handleStartGame}
          onSecondaryAction={handleEndGame}
        />
      );
    }

    const currentLevel = CHORD_LEVELS.find(l => l.id === session.level) ?? CHORD_LEVELS[0];

    return (
      <div className="space-y-3">
        <ScoreDisplay
          answers={session.answers}
          totalQuestions={session.questions.length}
          currentQuestionIndex={state.currentQuestionIndex}
        />

        {computed.currentQuestion && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ChordPlayer
              question={computed.currentQuestion}
              disabled={state.showResult}
            />

            <ChordAnswerButtons
              availableChords={currentLevel.chords}
              onAnswer={handleAnswer}
              questionId={computed.currentQuestion.id}
              correctAnswer={computed.currentQuestion.chordQuality}
              disabled={state.showResult}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ExerciseHeader
        title="Chord Quality"
        icon="C"
        iconClassName="bg-gradient-to-br from-amber-400/90 to-orange-500/80"
        currentView={currentView}
        onViewChange={setCurrentView}
        onBack={onBack}
      />

      {!isInitialized && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-center">
          <p className="text-amber-200">Audio engine loading...</p>
        </div>
      )}

      {currentView === 'training' ? (
        renderTrainingView()
      ) : (
        <div className="space-y-6">
          <ProgressChart exerciseType="chords" levels={CHORD_LEVELS} />
          <SessionHistory exerciseType="chords" levels={CHORD_LEVELS} />
        </div>
      )}
    </div>
  );
}
