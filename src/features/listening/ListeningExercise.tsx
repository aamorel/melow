import { useEffect, useState } from 'react';
import { GameControls } from '../../components/Game/GameControls';
import { IntervalPlayer } from '../../components/Game/IntervalPlayer';
import { AnswerButtons } from '../../components/Game/AnswerButtons';
import { ScoreDisplay } from '../../components/Game/ScoreDisplay';
import { ProgressChart } from '../../components/Stats/ProgressChart';
import { SessionHistory } from '../../components/Stats/SessionHistory';
import { Button } from '../../components/UI/Button';
import { useGameState } from '../../hooks/useGameState';
import { useAudio } from '../../hooks/useAudio';
import { ANSWER_FEEDBACK_TIMINGS, GAME_LEVELS } from '../../utils/constants';
import type { Interval } from '../../types/game';

type ListeningView = 'training' | 'stats';

interface ListeningExerciseProps {
  onBack?: () => void;
}

export function ListeningExercise({ onBack }: ListeningExerciseProps) {
  const [currentView, setCurrentView] = useState<ListeningView>('training');
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
              Play Again
            </Button>
            <Button onClick={handleEndGame} variant="secondary" size="lg" className="w-full md:w-auto ml-0 md:ml-3">
              Back to Menu
            </Button>
          </div>
        </div>
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/90 to-blue-500/80 text-lg font-semibold text-slate-950">
            L
          </div>
          <h2 className="text-2xl font-semibold">Listening</h2>
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
              onClick={onBack}
              variant="secondary"
              className="h-10 w-10 rounded-full p-0 border border-slate-700/80 bg-slate-900/70 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
              aria-label="Back to exercises"
            >
              &larr;
            </Button>
          )}
        </div>
      </div>

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
