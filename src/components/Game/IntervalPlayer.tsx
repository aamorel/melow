import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Question } from '../../types/game';
import { useAudio } from '../../hooks/useAudio';
import { usePlaybackPulse } from '../../hooks/usePlaybackPulse';
import { usePlaybackHotkey } from '../../hooks/usePlaybackHotkey';
import { PlaybackButton } from './PlaybackButton';

const NOTE_DURATION_SECONDS = 1.0;
const INTERVAL_GAP_SECONDS = 0.1;
const SECOND_PULSE_DELAY_MS = (NOTE_DURATION_SECONDS + INTERVAL_GAP_SECONDS) * 1000;

interface IntervalPlayerProps {
  question: Question;
  disabled?: boolean;
}

export function IntervalPlayer({ question, disabled = false }: IntervalPlayerProps) {
  const { playInterval, isPlaying } = useAudio();
  const { pulsePhase, pulseTick, triggerPulse, resetPulse } = usePlaybackPulse({
    pulses: 2,
    secondPulseDelayMs: SECOND_PULSE_DELAY_MS,
  });
  const lastPlayedQuestionIdRef = useRef<number | null>(null);
  const isCurrentQuestionPlaying = isPlaying && lastPlayedQuestionIdRef.current === question.id;
  const pulseBorderClass = useMemo(() => (
    pulsePhase === 2 ? 'border-cyan-300/70' : 'border-amber-300/70'
  ), [pulsePhase]);

  const handlePlay = useCallback(async () => {
    if (disabled) return;

    lastPlayedQuestionIdRef.current = question.id;
    triggerPulse();
    await playInterval(
      question.startingNote, 
      question.targetNote, 
      question.instrument,
      INTERVAL_GAP_SECONDS
    );
  }, [
    disabled,
    playInterval,
    question.id,
    question.instrument,
    question.startingNote,
    question.targetNote,
    triggerPulse,
  ]);

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
      <h3 className="text-lg font-semibold mb-2">Interval</h3>
      
      <div className="mb-3 text-sm">
        <p className="text-slate-400">
          {question.startingNote.note}{question.startingNote.octave} • {question.instrument}
        </p>
      </div>

      <PlaybackButton
        onClick={handlePlay}
        disabled={disabled}
        isPlaying={isCurrentQuestionPlaying}
        label="Play interval"
        playingLabel="Playing interval"
        pulsePhase={pulsePhase}
        pulseTick={pulseTick}
        pulseClassName={pulseBorderClass}
        className="mb-2"
      />
    </div>
  );
}
