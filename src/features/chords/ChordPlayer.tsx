import { useCallback, useEffect } from 'react';
import type { ChordQuestion } from '../../types/chord';
import { useAudio } from '../../hooks/useAudio';
import { Button } from '../../components/UI/Button';
import { PlaybackIcon } from '../../components/UI/PlaybackIcon';

interface ChordPlayerProps {
  question: ChordQuestion;
  disabled?: boolean;
}

export function ChordPlayer({ question, disabled = false }: ChordPlayerProps) {
  const { playChord, isPlaying } = useAudio();

  const handlePlay = useCallback(async () => {
    if (disabled || isPlaying) return;
    await playChord(question.notes, question.instrument);
  }, [disabled, isPlaying, playChord, question.instrument, question.notes]);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      const target = event.target as HTMLElement | null;
      if (target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON' ||
        target.isContentEditable
      )) {
        return;
      }

      event.preventDefault();
      void handlePlay();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabled, handlePlay]);

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
        className="mb-2 h-12 w-12 rounded-full p-0"
        aria-label={isPlaying ? 'Playing chord' : 'Play chord'}
        title={isPlaying ? 'Playing chord' : 'Play chord'}
      >
        <span className="sr-only">{isPlaying ? 'Playing' : 'Play chord'}</span>
        <PlaybackIcon state={isPlaying ? 'pause' : 'play'} className="h-5 w-5" />
      </Button>
    </div>
  );
}
