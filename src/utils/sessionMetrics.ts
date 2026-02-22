type AnswerMetric = {
  isCorrect: boolean;
  responseTimeMs: number;
};

export function calculateSessionMetrics<TAnswer extends AnswerMetric>(answers: TAnswer[]) {
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  const accuracyPercent = totalQuestions > 0
    ? (correctAnswers / totalQuestions) * 100
    : 0;
  const averageTimeMs = totalQuestions > 0
    ? answers.reduce((sum, answer) => sum + answer.responseTimeMs, 0) / totalQuestions
    : 0;

  return {
    correctAnswers,
    totalQuestions,
    accuracyPercent,
    averageTimeMs,
  };
}
