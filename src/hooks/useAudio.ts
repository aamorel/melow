import { useCallback, useEffect, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import type { Note, Instrument } from '../types/game';

export function useAudio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioEngine.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initAudio();
  }, []);

  const playNote = useCallback(async (note: Note, instrument: Instrument, duration = 1.0) => {
    if (!isInitialized) return;
    
    setIsPlaying(true);
    try {
      await audioEngine.playNote(note.frequency, instrument, duration);
    } catch (error) {
      console.error('Failed to play note:', error);
    } finally {
      setTimeout(() => setIsPlaying(false), duration * 1000);
    }
  }, [isInitialized]);

  const playInterval = useCallback(async (note1: Note, note2: Note, instrument: Instrument, gap = 0.1) => {
    if (!isInitialized) return;
    
    setIsPlaying(true);
    try {
      await audioEngine.playInterval(note1.frequency, note2.frequency, instrument, gap);
    } catch (error) {
      console.error('Failed to play interval:', error);
    } finally {
      setTimeout(() => setIsPlaying(false), (2.1 + gap) * 1000);
    }
  }, [isInitialized]);

  const setVolume = useCallback((volume: number) => {
    audioEngine.setVolume(volume);
  }, []);

  return {
    isInitialized,
    isPlaying,
    playNote,
    playInterval,
    setVolume,
  };
}