import type { ChordQuality } from '../../types/chord';
import { CHORD_QUALITIES } from '../../utils/constants';
import { AnswerGrid } from '../../components/Game/AnswerGrid';

interface ChordAnswerButtonsProps {
  availableChords: ChordQuality[];
  onAnswer: (answer: ChordQuality, responseTime: number) => void;
  questionId: number;
  correctAnswer: ChordQuality;
  disabled?: boolean;
}

export function ChordAnswerButtons({
  availableChords,
  onAnswer,
  questionId,
  correctAnswer,
  disabled = false,
}: ChordAnswerButtonsProps) {
  return (
    <AnswerGrid
      title="Chord quality"
      options={availableChords}
      getLabel={(quality) => CHORD_QUALITIES[quality].name}
      onAnswer={onAnswer}
      questionId={questionId}
      correctAnswer={correctAnswer}
      disabled={disabled}
    />
  );
}
