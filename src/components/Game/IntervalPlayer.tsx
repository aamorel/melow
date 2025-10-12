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
    <div className="bg-white rounded-lg p-4 shadow-md text-center">
      <h3 className="text-lg font-semibold mb-2">Listen to the interval</h3>
      
      <div className="mb-3 text-sm">
        <p className="text-gray-600">
          {question.startingNote.note}{question.startingNote.octave} • {question.instrument}
        </p>
      </div>

      <Button
        onClick={handlePlay}
        disabled={disabled || isPlaying}
        size="lg"
        className="mb-2"
      >
        {isPlaying ? '🎵 Playing...' : '▶️ Play Interval'}
      </Button>

      {playCount > 0 && (
        <p className="text-xs text-gray-500">
          Played {playCount} time{playCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
