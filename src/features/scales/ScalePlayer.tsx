import { useCallback, useEffect } from 'react';
import type { ScaleQuestion } from '../../types/scale';
import { useAudio } from '../../hooks/useAudio';
import { usePlaybackPulse } from '../../hooks/usePlaybackPulse';
import { usePlaybackHotkey } from '../../hooks/usePlaybackHotkey';
import { PlaybackButton } from '../../components/Game/PlaybackButton';

const NOTE_DURATION_SECONDS = 0.55;
const NOTE_GAP_SECONDS = 0.05;

interface ScalePlayerProps {
  question: ScaleQuestion;
  disabled?: boolean;
}

export function ScalePlayer({ question, disabled = false }: ScalePlayerProps) {
  const { playScale, isPlaying } = useAudio();
  const { pulsePhase, pulseTick, triggerPulse, resetPulse } = usePlaybackPulse({ pulses: 1 });

  const handlePlay = useCallback(async () => {
    if (disabled || isPlaying) return;
    triggerPulse();
    await playScale(question.notes, question.instrument, NOTE_DURATION_SECONDS, NOTE_GAP_SECONDS);
  }, [disabled, isPlaying, playScale, question.instrument, question.notes, triggerPulse]);

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
      <h3 className="text-lg font-semibold mb-2">Scale</h3>

      <div className="mb-3 text-sm">
        <p className="text-slate-400">
          Root {question.rootNote.note}{question.rootNote.octave} • {question.instrument}
        </p>
        <p className="text-slate-500">Ascending one octave</p>
      </div>

      <PlaybackButton
        onClick={handlePlay}
        disabled={disabled || isPlaying}
        isPlaying={isPlaying}
        label="Play scale"
        playingLabel="Playing scale"
        pulsePhase={pulsePhase}
        pulseTick={pulseTick}
        className="mb-2"
      />
    </div>
  );
}
