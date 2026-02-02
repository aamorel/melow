import { useEffect, useState } from 'react';
import type { ChordQuestion } from '../../types/chord';
import { useAudio } from '../../hooks/useAudio';
import { Button } from '../../components/UI/Button';

interface ChordPlayerProps {
  question: ChordQuestion;
  disabled?: boolean;
}

export function ChordPlayer({ question, disabled = false }: ChordPlayerProps) {
  const { playChord, isPlaying } = useAudio();
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    setPlayCount(0);
  }, [question.id]);

  const handlePlay = async () => {
    if (disabled || isPlaying) return;
    await playChord(question.notes, question.instrument);
    setPlayCount(prev => prev + 1);
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <h3 className="text-lg font-semibold mb-2">Chord</h3>

      <div className="mb-3 text-sm">
        <p className="text-slate-400">
          Root {question.rootNote.note}{question.rootNote.octave} • {question.instrument}
        </p>
      </div>

      <Button
        onClick={handlePlay}
        disabled={disabled || isPlaying}
        size="lg"
        className="mb-2"
      >
        {isPlaying ? 'Playing...' : 'Play Chord'}
      </Button>

      {playCount > 0 && (
        <p className="text-xs text-slate-500">
          Played {playCount} time{playCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
