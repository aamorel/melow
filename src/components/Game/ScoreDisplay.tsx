type ScoreAnswer = {
  isCorrect: boolean;
  responseTimeMs: number;
};

interface ScoreDisplayProps {
  answers: ScoreAnswer[];
  totalQuestions: number;
  currentQuestionIndex: number;
}

export function ScoreDisplay({ answers, totalQuestions, currentQuestionIndex }: ScoreDisplayProps) {
  const answeredQuestions = answers.length;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
  const averageResponseTime = answeredQuestions > 0 
    ? answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / answeredQuestions 
    : 0;

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-3">
        <div>
          <p className="text-lg font-bold text-cyan-300">
            {currentQuestionIndex + 1}/{totalQuestions}
          </p>
          <p className="text-xs text-slate-400">Question</p>
        </div>
        
        <div>
          <p className="text-lg font-bold text-emerald-300">
            {correctAnswers}/{answeredQuestions}
          </p>
          <p className="text-xs text-slate-400">Correct</p>
        </div>
        
        <div>
          <p className="text-lg font-bold text-sky-300">
            {accuracy.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400">Accuracy</p>
        </div>
        
        <div>
          <p className="text-lg font-bold text-amber-300">
            {(averageResponseTime / 1000).toFixed(1)}s
          </p>
          <p className="text-xs text-slate-400">Avg Time</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-2">
        <div 
          className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
