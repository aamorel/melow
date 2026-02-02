import { useEffect, useState } from 'react';
import type { ChordQuality } from '../../types/chord';
import { CHORD_QUALITIES } from '../../utils/constants';
import { Button } from '../../components/UI/Button';

interface ChordAnswerButtonsProps {
  availableChords: ChordQuality[];
  onAnswer: (answer: ChordQuality, responseTime: number) => void;
  questionId: number;
  disabled?: boolean;
}

export function ChordAnswerButtons({
  availableChords,
  onAnswer,
  questionId,
  disabled = false,
}: ChordAnswerButtonsProps) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<ChordQuality | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [questionId]);

  useEffect(() => {
    if (disabled) {
      setStartTime(null);
      return;
    }

    setStartTime(Date.now());
  }, [questionId, disabled]);

  const handleAnswer = (quality: ChordQuality) => {
    if (disabled || !startTime) return;

    const responseTime = Date.now() - startTime;
    setSelectedAnswer(quality);
    onAnswer(quality, responseTime);
  };

  const getButtonVariant = (quality: ChordQuality) => {
    if (!selectedAnswer) return 'secondary';
    return selectedAnswer === quality ? 'primary' : 'secondary';
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <h3 className="text-lg font-semibold mb-3 text-center">Chord quality</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {availableChords.map((quality) => (
          <Button
            key={quality}
            onClick={() => handleAnswer(quality)}
            disabled={disabled}
            variant={getButtonVariant(quality)}
            className="text-xs py-2 px-2"
          >
            {CHORD_QUALITIES[quality].name}
          </Button>
        ))}
      </div>
    </div>
  );
}
