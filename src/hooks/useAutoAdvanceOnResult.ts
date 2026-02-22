import { useEffect } from 'react';

type FeedbackTimings = {
  correctMs: number;
  incorrectMs: number;
};

interface AutoAdvanceOptions<TAnswer extends { isCorrect: boolean }> {
  isActive: boolean;
  showResult: boolean;
  currentSession: { answers: TAnswer[] } | null;
  currentQuestionIndex: number;
  onNextQuestion: () => void;
  timings: FeedbackTimings;
}

export function useAutoAdvanceOnResult<TAnswer extends { isCorrect: boolean }>({
  isActive,
  showResult,
  currentSession,
  currentQuestionIndex,
  onNextQuestion,
  timings,
}: AutoAdvanceOptions<TAnswer>) {
  useEffect(() => {
    if (!isActive || !showResult || !currentSession) return;

    const answer = currentSession.answers[currentQuestionIndex];
    if (!answer) return;

    const delayMs = answer.isCorrect ? timings.correctMs : timings.incorrectMs;
    const timer = window.setTimeout(() => {
      onNextQuestion();
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    isActive,
    showResult,
    currentSession,
    currentQuestionIndex,
    onNextQuestion,
    timings.correctMs,
    timings.incorrectMs,
  ]);
}
