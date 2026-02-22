import { useState } from 'react';
import { ScoreDisplay } from '../../components/Game/ScoreDisplay';
import { SessionCompleteCard } from '../../components/Game/SessionCompleteCard';
import { ProgressChart } from '../../components/Stats/ProgressChart';
import { SessionHistory } from '../../components/Stats/SessionHistory';
import { ExerciseHeader, ExerciseView } from '../../components/UI/ExerciseHeader';
import { useAutoAdvanceOnResult } from '../../hooks/useAutoAdvanceOnResult';
import { useScaleGameState } from '../../hooks/useScaleGameState';
import { useAudio } from '../../hooks/useAudio';
import { ANSWER_FEEDBACK_TIMINGS, SCALE_LEVELS } from '../../utils/constants';
import { calculateSessionMetrics } from '../../utils/sessionMetrics';
import type { ScaleType } from '../../types/scale';
import { ScaleControls } from './ScaleControls';
import { ScalePlayer } from './ScalePlayer';
import { ScaleAnswerButtons } from './ScaleAnswerButtons';

interface ScaleExerciseProps {
  onBack?: () => void;
}

export function ScaleExercise({ onBack }: ScaleExerciseProps) {
  const [currentView, setCurrentView] = useState<ExerciseView>('training');
  const { state, actions, computed } = useScaleGameState();
  const { isInitialized } = useAudio();
  const { nextQuestion } = actions;

  const handleStartGame = () => {
    actions.startGame(state.selectedLevel, state.selectedInstrument);
  };

  const handleAnswer = (answer: ScaleType, responseTime: number) => {
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
        <ScaleControls
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

    const currentLevel = SCALE_LEVELS.find(l => l.id === session.level) ?? SCALE_LEVELS[0];

    return (
      <div className="space-y-3">
        <ScoreDisplay
          answers={session.answers}
          totalQuestions={session.questions.length}
          currentQuestionIndex={state.currentQuestionIndex}
        />

        {computed.currentQuestion && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ScalePlayer
              question={computed.currentQuestion}
              disabled={state.showResult}
            />

            <ScaleAnswerButtons
              availableScales={currentLevel.scales}
              onAnswer={handleAnswer}
              questionId={computed.currentQuestion.id}
              correctAnswer={computed.currentQuestion.scaleType}
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
        title="Scale Recognition"
        icon="S"
        iconClassName="bg-gradient-to-br from-emerald-300/90 to-cyan-400/80"
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
          <ProgressChart exerciseType="scales" levels={SCALE_LEVELS} />
          <SessionHistory exerciseType="scales" levels={SCALE_LEVELS} />
        </div>
      )}
    </div>
  );
}
