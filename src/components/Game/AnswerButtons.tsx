import { Interval } from '../../types/game';
import { INTERVALS } from '../../utils/constants';
import { AnswerGrid } from './AnswerGrid';

interface AnswerButtonsProps {
  availableIntervals: Interval[];
  onAnswer: (answer: Interval, responseTime: number) => void;
  questionId: number;
  correctAnswer: Interval;
  disabled?: boolean;
}

export function AnswerButtons({
  availableIntervals,
  onAnswer,
  questionId,
  correctAnswer,
  disabled = false,
}: AnswerButtonsProps) {
  return (
    <AnswerGrid
      title="Intervals"
      options={availableIntervals}
      getLabel={(interval) => INTERVALS[interval].name}
      onAnswer={onAnswer}
      questionId={questionId}
      correctAnswer={correctAnswer}
      disabled={disabled}
    />
  );
}
