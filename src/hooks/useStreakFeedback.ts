import { useEffect, useMemo, useRef, useState } from 'react';
import { getCurrentStreak } from '../utils/streak';

type StreakAnswer = {
  isCorrect: boolean;
};

export function useStreakFeedback(answers: StreakAnswer[]) {
  const streak = useMemo(() => getCurrentStreak(answers), [answers]);
  const [isPulsing, setIsPulsing] = useState(false);
  const lastStreakRef = useRef(0);

  useEffect(() => {
    const shouldPulse = streak >= 2 && streak > lastStreakRef.current;
    lastStreakRef.current = streak;

    if (!shouldPulse) {
      if (streak < 2 && isPulsing) {
        setIsPulsing(false);
      }
      return undefined;
    }

    setIsPulsing(true);
    const timeout = window.setTimeout(() => setIsPulsing(false), 700);
    return () => window.clearTimeout(timeout);
  }, [isPulsing, streak]);

  return { streak, isPulsing };
}
