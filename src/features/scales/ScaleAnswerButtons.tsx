import type { ScaleType } from '../../types/scale';
import { SCALE_TYPES } from '../../utils/constants';
import { AnswerGrid } from '../../components/Game/AnswerGrid';

interface ScaleAnswerButtonsProps {
  availableScales: ScaleType[];
  onAnswer: (answer: ScaleType, responseTime: number) => void;
  questionId: number;
  correctAnswer: ScaleType;
  disabled?: boolean;
}

export function ScaleAnswerButtons({
  availableScales,
  onAnswer,
  questionId,
  correctAnswer,
  disabled = false,
}: ScaleAnswerButtonsProps) {
  return (
    <AnswerGrid
      title="Scale type"
      options={availableScales}
      getLabel={(scale) => SCALE_TYPES[scale].name}
      onAnswer={onAnswer}
      questionId={questionId}
      correctAnswer={correctAnswer}
      disabled={disabled}
    />
  );
}
