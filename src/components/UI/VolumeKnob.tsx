import { useMemo } from 'react';
import { useAudioSettings } from '../../hooks/useAudioSettings';
import { Knob } from './Knob';

const VOLUME_STEPS = 10;

interface VolumeKnobProps {
  className?: string;
}

export function VolumeKnob({ className = '' }: VolumeKnobProps) {
  const { volume, setVolume } = useAudioSettings();
  const stepValue = useMemo(() => {
    const raw = Math.round(volume * (VOLUME_STEPS - 1));
    return Math.max(0, Math.min(VOLUME_STEPS - 1, raw));
  }, [volume]);

  const handleChange = (nextStep: number) => {
    const normalized = nextStep / (VOLUME_STEPS - 1);
    setVolume(normalized);
  };

  return (
    <div className={`flex items-center gap-2 shrink-0 ${className}`}>
      <span className="sr-only">Volume</span>
      <Knob
        ariaLabel="Volume"
        value={stepValue}
        steps={VOLUME_STEPS}
        size="sm"
        onChange={handleChange}
      />
    </div>
  );
}
