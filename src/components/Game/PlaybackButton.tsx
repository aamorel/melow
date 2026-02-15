import { Button } from '../UI/Button';
import { PlaybackIcon } from '../UI/PlaybackIcon';

interface PlaybackButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isPlaying?: boolean;
  label: string;
  playingLabel?: string;
  pulsePhase?: 1 | 2 | null;
  pulseTick?: number;
  pulseClassName?: string;
  className?: string;
}

export function PlaybackButton({
  onClick,
  disabled = false,
  isPlaying = false,
  label,
  playingLabel,
  pulsePhase = null,
  pulseTick = 0,
  pulseClassName = 'border-amber-300/70',
  className = '',
}: PlaybackButtonProps) {
  const currentLabel = isPlaying ? (playingLabel ?? label) : label;

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className={`relative h-12 w-12 rounded-full p-0 overflow-visible ${className}`}
      aria-label={currentLabel}
      title={currentLabel}
    >
      {pulsePhase !== null && (
        <span
          key={`${pulsePhase}-${pulseTick}`}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 rounded-full border-2 motion-reduce:hidden interval-ring ${pulseClassName}`}
        />
      )}
      <span className="sr-only">{currentLabel}</span>
      <span className="relative z-10">
        <PlaybackIcon state={isPlaying ? 'pause' : 'play'} className="h-5 w-5" />
      </span>
    </Button>
  );
}
