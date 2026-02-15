import { useCallback, useEffect } from 'react';
import type { ChordQuestion } from '../../types/chord';
import { useAudio } from '../../hooks/useAudio';
import { usePlaybackPulse } from '../../hooks/usePlaybackPulse';
import { usePlaybackHotkey } from '../../hooks/usePlaybackHotkey';
import { PlaybackButton } from '../../components/Game/PlaybackButton';

interface ChordPlayerProps {
  question: ChordQuestion;
  disabled?: boolean;
}

export function ChordPlayer({ question, disabled = false }: ChordPlayerProps) {
  const { playChord, isPlaying } = useAudio();
  const { pulsePhase, pulseTick, triggerPulse, resetPulse } = usePlaybackPulse({ pulses: 1 });

  const handlePlay = useCallback(async () => {
    if (disabled || isPlaying) return;
    triggerPulse();
    await playChord(question.notes, question.instrument);
  }, [disabled, isPlaying, playChord, question.instrument, question.notes, triggerPulse]);

  usePlaybackHotkey({
    enabled: !disabled,
    onTrigger: () => {
      void handlePlay();
    },
  });

  useEffect(() => {
    resetPulse();
  }, [question.id, resetPulse]);

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <h3 className="text-lg font-semibold mb-2">Chord</h3>

      <div className="mb-3 text-sm">
        <p className="text-slate-400">
          Root {question.rootNote.note}{question.rootNote.octave} • {question.instrument}
        </p>
      </div>

      <PlaybackButton
        onClick={handlePlay}
        disabled={disabled || isPlaying}
        isPlaying={isPlaying}
        label="Play chord"
        playingLabel="Playing chord"
        pulsePhase={pulsePhase}
        pulseTick={pulseTick}
        className="mb-2"
      />
    </div>
  );
}
