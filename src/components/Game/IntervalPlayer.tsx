import { useState, useEffect } from 'react';
import { Question } from '../../types/game';
import { useAudio } from '../../hooks/useAudio';
import { Button } from '../UI/Button';

interface IntervalPlayerProps {
  question: Question;
  disabled?: boolean;
}

export function IntervalPlayer({ question, disabled = false }: IntervalPlayerProps) {
  const { playInterval, isPlaying } = useAudio();
  const [playCount, setPlayCount] = useState(0);
  
  useEffect(() => {
    setPlayCount(0);
  }, [question.id]);

  const handlePlay = async () => {
    if (disabled || isPlaying) return;
    
    await playInterval(
      question.startingNote, 
      question.targetNote, 
      question.instrument
    );
    setPlayCount(prev => prev + 1);
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <h3 className="text-lg font-semibold mb-2">Interval</h3>
      
      <div className="mb-3 text-sm">
        <p className="text-slate-400">
          {question.startingNote.note}{question.startingNote.octave} • {question.instrument}
        </p>
      </div>

      <Button
        onClick={handlePlay}
        disabled={disabled || isPlaying}
        size="lg"
        className="mb-2"
      >
        {isPlaying ? 'Playing...' : 'Play'}
      </Button>

      {playCount > 0 && (
        <p className="text-xs text-slate-500">
          Played {playCount} time{playCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
