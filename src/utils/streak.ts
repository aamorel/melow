type StreakAnswer = {
  isCorrect: boolean;
};

export function getCurrentStreak(answers: StreakAnswer[]): number {
  let streak = 0;
  for (let i = answers.length - 1; i >= 0; i -= 1) {
    if (!answers[i].isCorrect) break;
    streak += 1;
  }
  return streak;
}
