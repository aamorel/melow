import { useCallback, useEffect, useRef } from 'react';
import { Question } from '../../types/game';
import { useAudio } from '../../hooks/useAudio';
import { Button } from '../UI/Button';
import { PlaybackIcon } from '../UI/PlaybackIcon';

interface IntervalPlayerProps {
  question: Question;
  disabled?: boolean;
}

export function IntervalPlayer({ question, disabled = false }: IntervalPlayerProps) {
  const { playInterval, isPlaying } = useAudio();
  const lastPlayedQuestionIdRef = useRef<number | null>(null);
  const isCurrentQuestionPlaying = isPlaying && lastPlayedQuestionIdRef.current === question.id;

  const handlePlay = useCallback(async () => {
    if (disabled) return;
    if (isCurrentQuestionPlaying) return;

    lastPlayedQuestionIdRef.current = question.id;
    await playInterval(
      question.startingNote, 
      question.targetNote, 
      question.instrument
    );
  }, [disabled, isCurrentQuestionPlaying, playInterval, question.id, question.instrument, question.startingNote, question.targetNote]);

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
      <h3 className="text-lg font-semibold mb-2">Interval</h3>
      
      <div className="mb-3 text-sm">
        <p className="text-slate-400">
          {question.startingNote.note}{question.startingNote.octave} • {question.instrument}
        </p>
      </div>

      <Button
        onClick={handlePlay}
        disabled={disabled || isCurrentQuestionPlaying}
        size="lg"
        className="mb-2 h-12 w-12 rounded-full p-0"
        aria-label={isCurrentQuestionPlaying ? 'Playing interval' : 'Play interval'}
        title={isCurrentQuestionPlaying ? 'Playing interval' : 'Play interval'}
      >
        <span className="sr-only">{isCurrentQuestionPlaying ? 'Playing' : 'Play'}</span>
        <PlaybackIcon state={isCurrentQuestionPlaying ? 'pause' : 'play'} className="h-5 w-5" />
      </Button>
    </div>
  );
}
