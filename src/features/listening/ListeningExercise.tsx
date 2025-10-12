import { useState } from 'react';
import { GameControls } from '../../components/Game/GameControls';
import { IntervalPlayer } from '../../components/Game/IntervalPlayer';
import { AnswerButtons } from '../../components/Game/AnswerButtons';
import { ScoreDisplay } from '../../components/Game/ScoreDisplay';
import { ProgressChart } from '../../components/Stats/ProgressChart';
import { SessionHistory } from '../../components/Stats/SessionHistory';
import { Button } from '../../components/UI/Button';
import { useGameState } from '../../hooks/useGameState';
import { useAudio } from '../../hooks/useAudio';
import { GAME_LEVELS, INTERVALS } from '../../utils/constants';
import type { Interval } from '../../types/game';

type ListeningView = 'training' | 'stats';

interface ListeningExerciseProps {
  onBack?: () => void;
}

export function ListeningExercise({ onBack }: ListeningExerciseProps) {
  const [currentView, setCurrentView] = useState<ListeningView>('training');
  const { state, actions, computed } = useGameState();
  const { isInitialized } = useAudio();

  const handleStartGame = () => {
    actions.startGame(state.selectedLevel, state.selectedInstrument);
  };

  const handleAnswer = (answer: Interval, responseTime: number) => {
    actions.submitAnswer(answer, responseTime);
  };

  const handleNextQuestion = () => {
    actions.nextQuestion();
  };

  const handleEndGame = () => {
    actions.endGame();
  };

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
        <div className="bg-white rounded-lg p-8 shadow-md text-center">
          <h2 className="text-3xl font-bold mb-6 text-green-600">Session Complete! 🎉</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{correctAnswers}/10</p>
              <p className="text-gray-600">Correct Answers</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{accuracy.toFixed(1)}%</p>
              <p className="text-gray-600">Accuracy</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{(averageTime / 1000).toFixed(1)}s</p>
              <p className="text-gray-600">Average Time</p>
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
          session={session} 
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
              disabled={state.showResult}
            />
          </div>
        )}

        {state.showResult && computed.currentQuestion && (
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            {session.answers[state.currentQuestionIndex]?.isCorrect ? (
              <div className="text-green-600">
                <h3 className="text-xl font-bold mb-1">✅ Correct!</h3>
                <p className="mb-3">That was indeed a {INTERVALS[computed.currentQuestion.correctInterval].name}</p>
              </div>
            ) : (
              <div className="text-red-600">
                <h3 className="text-xl font-bold mb-1">❌ Incorrect</h3>
                <p className="mb-3">The correct answer was: {INTERVALS[computed.currentQuestion.correctInterval].name}</p>
              </div>
            )}

            {state.currentQuestionIndex < session.questions.length - 1 ? (
              <Button onClick={handleNextQuestion} variant="primary" size="lg">
                Next Question →
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} variant="success" size="lg">
                Finish Session
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => setCurrentView('training')}
            variant={currentView === 'training' ? 'primary' : 'secondary'}
          >
            🎵 Training
          </Button>
          <Button 
            onClick={() => setCurrentView('stats')}
            variant={currentView === 'stats' ? 'primary' : 'secondary'}
          >
            📊 Progress
          </Button>
        </div>

        {onBack && (
          <Button onClick={onBack} variant="secondary">
            ← Choose Exercise
          </Button>
        )}
      </div>

      {!isInitialized && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">🎵 Initializing audio engine...</p>
        </div>
      )}
      
      {currentView === 'training' ? (
        renderTrainingView()
      ) : (
        <div className="space-y-6">
          <ProgressChart />
          <SessionHistory />
        </div>
      )}
    </div>
  );
}

