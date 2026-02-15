import { useCallback, useEffect, useRef, useState } from 'react';

interface PlaybackPulseOptions {
  pulses?: 1 | 2;
  secondPulseDelayMs?: number;
}

export function usePlaybackPulse({
  pulses = 1,
  secondPulseDelayMs = 0,
}: PlaybackPulseOptions) {
  const [pulsePhase, setPulsePhase] = useState<1 | 2 | null>(null);
  const [pulseTick, setPulseTick] = useState(0);
  const secondPulseTimeoutRef = useRef<number | null>(null);

  const clearPulseTimeout = useCallback(() => {
    if (secondPulseTimeoutRef.current !== null) {
      window.clearTimeout(secondPulseTimeoutRef.current);
      secondPulseTimeoutRef.current = null;
    }
  }, []);

  const triggerPulse = useCallback(() => {
    clearPulseTimeout();
    setPulsePhase(1);
    setPulseTick((tick) => tick + 1);

    if (pulses === 2 && secondPulseDelayMs > 0) {
      secondPulseTimeoutRef.current = window.setTimeout(() => {
        setPulsePhase(2);
        setPulseTick((tick) => tick + 1);
        secondPulseTimeoutRef.current = null;
      }, secondPulseDelayMs);
    }
  }, [clearPulseTimeout, pulses, secondPulseDelayMs]);

  const resetPulse = useCallback(() => {
    clearPulseTimeout();
    setPulsePhase(null);
  }, [clearPulseTimeout]);

  useEffect(() => {
    return () => {
      clearPulseTimeout();
    };
  }, [clearPulseTimeout]);

  return {
    pulsePhase,
    pulseTick,
    triggerPulse,
    resetPulse,
  };
}
