import { GameSession } from '../../types/game';

interface ScoreDisplayProps {
  session: GameSession;
  currentQuestionIndex: number;
}

export function ScoreDisplay({ session, currentQuestionIndex }: ScoreDisplayProps) {
  const answeredQuestions = session.answers.length;
  const correctAnswers = session.answers.filter(a => a.isCorrect).length;
  const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
  const averageResponseTime = answeredQuestions > 0 
    ? session.answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / answeredQuestions 
    : 0;

  return (
    <div className="bg-white rounded-lg p-3 shadow-md">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-3">
        <div>
          <p className="text-lg font-bold text-blue-600">
            {currentQuestionIndex + 1}/{session.questions.length}
          </p>
          <p className="text-xs text-gray-600">Question</p>
        </div>
        
        <div>
          <p className="text-lg font-bold text-green-600">
            {correctAnswers}/{answeredQuestions}
          </p>
          <p className="text-xs text-gray-600">Correct</p>
        </div>
        
        <div>
          <p className="text-lg font-bold text-purple-600">
            {accuracy.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600">Accuracy</p>
        </div>
        
        <div>
          <p className="text-lg font-bold text-orange-600">
            {(averageResponseTime / 1000).toFixed(1)}s
          </p>
          <p className="text-xs text-gray-600">Avg Time</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
