import { useState, useEffect } from 'react';
import { Interval } from '../../types/game';
import { INTERVALS } from '../../utils/constants';
import { Button } from '../UI/Button';

interface AnswerButtonsProps {
  availableIntervals: Interval[];
  onAnswer: (answer: Interval, responseTime: number) => void;
  questionId: number;
  disabled?: boolean;
}

export function AnswerButtons({ availableIntervals, onAnswer, questionId, disabled = false }: AnswerButtonsProps) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<Interval | null>(null);

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

  const handleAnswer = (interval: Interval) => {
    if (disabled || !startTime) return;
    
    const responseTime = Date.now() - startTime;
    setSelectedAnswer(interval);
    onAnswer(interval, responseTime);
  };

  const getButtonVariant = (interval: Interval) => {
    if (!selectedAnswer) return 'secondary';
    return selectedAnswer === interval ? 'primary' : 'secondary';
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <h3 className="text-lg font-semibold mb-3 text-center">Intervals</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {availableIntervals.map((interval) => (
          <Button
            key={interval}
            onClick={() => handleAnswer(interval)}
            disabled={disabled}
            variant={getButtonVariant(interval)}
            className="text-xs py-2 px-2"
          >
            {INTERVALS[interval].name}
          </Button>
        ))}
      </div>
    </div>
  );
}
