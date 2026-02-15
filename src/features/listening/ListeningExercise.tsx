import { useEffect, useState } from 'react';
import { GameControls } from '../../components/Game/GameControls';
import { IntervalPlayer } from '../../components/Game/IntervalPlayer';
import { AnswerButtons } from '../../components/Game/AnswerButtons';
import { ScoreDisplay } from '../../components/Game/ScoreDisplay';
import { SessionCompleteCard } from '../../components/Game/SessionCompleteCard';
import { ProgressChart } from '../../components/Stats/ProgressChart';
import { SessionHistory } from '../../components/Stats/SessionHistory';
import { ExerciseHeader, ExerciseView } from '../../components/UI/ExerciseHeader';
import { useGameState } from '../../hooks/useGameState';
import { useAudio } from '../../hooks/useAudio';
import { ANSWER_FEEDBACK_TIMINGS, GAME_LEVELS } from '../../utils/constants';
import type { Interval } from '../../types/game';

interface ListeningExerciseProps {
  onBack?: () => void;
}

export function ListeningExercise({ onBack }: ListeningExerciseProps) {
  const [currentView, setCurrentView] = useState<ExerciseView>('training');
  const { state, actions, computed } = useGameState();
  const { isInitialized } = useAudio();
  const { nextQuestion } = actions;

  const handleStartGame = () => {
    actions.startGame(state.selectedLevel, state.selectedInstrument);
  };

  const handleAnswer = (answer: Interval, responseTime: number) => {
    actions.submitAnswer(answer, responseTime);
  };

  const handleEndGame = () => {
    actions.endGame();
  };

  useEffect(() => {
    if (currentView !== 'training' || !state.showResult || !state.currentSession) return;

    const answer = state.currentSession.answers[state.currentQuestionIndex];
    if (!answer) return;

    const delayMs = answer.isCorrect
      ? ANSWER_FEEDBACK_TIMINGS.correctMs
      : ANSWER_FEEDBACK_TIMINGS.incorrectMs;

    const timer = window.setTimeout(() => {
      nextQuestion();
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentView, state.showResult, state.currentQuestionIndex, state.currentSession, nextQuestion]);

  const renderTrainingView = () => {
    const session = state.currentSession;

    if (!session) {
      return (
        <GameControls
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
      const correctAnswers = session.answers.filter(a => a.isCorrect).length;
      const accuracy = (correctAnswers / session.answers.length) * 100;
      const averageTime = session.answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / session.answers.length;

      return (
        <SessionCompleteCard
          correctAnswers={correctAnswers}
          totalQuestions={session.answers.length}
          accuracyPercent={accuracy}
          averageTimeMs={averageTime}
          primaryLabel="Play Again"
          secondaryLabel="Back to Menu"
          onPrimaryAction={handleStartGame}
          onSecondaryAction={handleEndGame}
        />
      );
    }

    const currentLevel = GAME_LEVELS.find(l => l.id === session.level)!;

    return (
      <div className="space-y-3">
        <ScoreDisplay
          answers={session.answers}
          totalQuestions={session.questions.length}
          currentQuestionIndex={state.currentQuestionIndex}
        />

        {computed.currentQuestion && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <IntervalPlayer 
              question={computed.currentQuestion}
              disabled={state.showResult}
            />

            <AnswerButtons
              availableIntervals={currentLevel.intervals}
              onAnswer={handleAnswer}
              questionId={computed.currentQuestion.id}
              correctAnswer={computed.currentQuestion.correctInterval}
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
        title="Listening"
        icon="L"
        iconClassName="bg-gradient-to-br from-amber-300/90 to-orange-400/80"
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
          <ProgressChart exerciseType="listening" levels={GAME_LEVELS} />
          <SessionHistory exerciseType="listening" levels={GAME_LEVELS} />
        </div>
      )}
    </div>
  );
}
