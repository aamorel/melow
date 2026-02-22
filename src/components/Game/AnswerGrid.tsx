import { useEffect, useState } from 'react';
import { ANSWER_FEEDBACK_TIMINGS } from '../../utils/constants';
import { Button } from '../UI/Button';

interface AnswerGridProps<T extends string> {
  title: string;
  options: readonly T[];
  getLabel: (option: T) => string;
  onAnswer: (answer: T, responseTime: number) => void;
  questionId: number;
  correctAnswer: T;
  disabled?: boolean;
}

export function AnswerGrid<T extends string>({
  title,
  options,
  getLabel,
  onAnswer,
  questionId,
  correctAnswer,
  disabled = false,
}: AnswerGridProps<T>) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<T | null>(null);
  const [revealCorrect, setRevealCorrect] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setRevealCorrect(false);
  }, [questionId]);

  useEffect(() => {
    if (disabled) {
      setStartTime(null);
      return;
    }

    setStartTime(Date.now());
  }, [questionId, disabled]);

  useEffect(() => {
    if (!disabled) {
      setRevealCorrect(false);
      return;
    }

    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === correctAnswer;
    if (isCorrect) {
      setRevealCorrect(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setRevealCorrect(true);
    }, ANSWER_FEEDBACK_TIMINGS.revealCorrectMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [disabled, selectedAnswer, correctAnswer]);

  const handleAnswer = (answer: T) => {
    if (disabled || !startTime) return;

    const responseTime = Date.now() - startTime;
    setSelectedAnswer(answer);
    onAnswer(answer, responseTime);
  };

  const getButtonVariant = (option: T) => {
    if (!selectedAnswer) return 'secondary';

    const isSelected = selectedAnswer === option;
    const isCorrectAnswer = correctAnswer === option;
    const showFeedback = disabled && selectedAnswer !== null;
    const showCorrect = showFeedback && isCorrectAnswer && (isSelected || revealCorrect);
    const showWrong = showFeedback && isSelected && !isCorrectAnswer;

    if (showCorrect) return 'success';
    if (showWrong) return 'danger';

    return isSelected && !showFeedback ? 'primary' : 'secondary';
  };

  const getButtonClasses = (option: T) => {
    if (!selectedAnswer) return 'text-xs py-2 px-2 !opacity-100';

    const isSelected = selectedAnswer === option;
    const isCorrectAnswer = correctAnswer === option;
    const showFeedback = disabled && selectedAnswer !== null;
    const showCorrect = showFeedback && isCorrectAnswer && (isSelected || revealCorrect);
    const showWrong = showFeedback && isSelected && !isCorrectAnswer;

    if (showCorrect) {
      return 'text-xs py-2 px-2 !opacity-100 answer-pop ring-2 ring-emerald-300/80 shadow-[0_0_24px_rgba(52,211,153,0.35)]';
    }

    if (showWrong) {
      return 'text-xs py-2 px-2 !opacity-100 answer-shake ring-2 ring-rose-300/80 shadow-[0_0_20px_rgba(251,113,133,0.25)]';
    }

    return 'text-xs py-2 px-2 !opacity-100';
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <h3 className="text-lg font-semibold mb-3 text-center">{title}</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {options.map((option) => (
          <Button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={disabled}
            variant={getButtonVariant(option)}
            className={getButtonClasses(option)}
          >
            {getLabel(option)}
          </Button>
        ))}
      </div>
    </div>
  );
}
