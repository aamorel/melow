import { useCallback, useEffect, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { database } from '../services/database';

const clampVolume = (value: number) => Math.max(0, Math.min(1, value));

export function useAudioSettings() {
  const [volume, setVolumeState] = useState(() => {
    const settings = database.getSettings();
    return clampVolume(settings.audio_volume ?? 0.7);
  });

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  const setVolume = useCallback((nextVolume: number) => {
    const clamped = clampVolume(nextVolume);
    setVolumeState(clamped);
    const settings = database.getSettings();
    database.saveSettings({ ...settings, audio_volume: clamped });
  }, []);

  return {
    volume,
    setVolume,
  };
}
