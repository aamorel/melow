import { useCallback, useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import type { Note, Instrument } from '../types/game';

export function useAudio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackTimeoutRef = useRef<number | null>(null);

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

    return () => {
      if (playbackTimeoutRef.current !== null) {
        window.clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, []);

  const schedulePlaybackStop = useCallback((durationMs: number) => {
    if (playbackTimeoutRef.current !== null) {
      window.clearTimeout(playbackTimeoutRef.current);
    }

    playbackTimeoutRef.current = window.setTimeout(() => {
      setIsPlaying(false);
      playbackTimeoutRef.current = null;
    }, durationMs);
  }, []);

  const playNote = useCallback(async (note: Note, instrument: Instrument, duration = 1.0) => {
    if (!isInitialized) return;
    
    setIsPlaying(true);
    try {
      await audioEngine.playNote(note.frequency, instrument, duration);
    } catch (error) {
      console.error('Failed to play note:', error);
    } finally {
      schedulePlaybackStop(duration * 1000);
    }
  }, [isInitialized, schedulePlaybackStop]);

  const playReferenceTone = useCallback(async (note: Note, duration = 1.1) => {
    if (!isInitialized) return;

    setIsPlaying(true);
    try {
      await audioEngine.playReferenceTone(note.frequency, duration);
    } catch (error) {
      console.error('Failed to play reference tone:', error);
    } finally {
      schedulePlaybackStop(duration * 1000);
    }
  }, [isInitialized, schedulePlaybackStop]);

  const playInterval = useCallback(async (note1: Note, note2: Note, instrument: Instrument, gap = 0.1) => {
    if (!isInitialized) return;
    
    const totalDuration = (2 + gap) * 1000;
    setIsPlaying(true);
    try {
      await audioEngine.playInterval(note1.frequency, note2.frequency, instrument, gap);
    } catch (error) {
      console.error('Failed to play interval:', error);
    } finally {
      schedulePlaybackStop(totalDuration);
    }
  }, [isInitialized, schedulePlaybackStop]);

  const playChord = useCallback(async (notes: Note[], instrument: Instrument, duration = 1.2) => {
    if (!isInitialized || notes.length === 0) return;

    setIsPlaying(true);
    try {
      await audioEngine.playChord(notes.map(note => note.frequency), instrument, duration);
    } catch (error) {
      console.error('Failed to play chord:', error);
    } finally {
      schedulePlaybackStop(duration * 1000);
    }
  }, [isInitialized, schedulePlaybackStop]);

  return {
    isInitialized,
    isPlaying,
    playNote,
    playInterval,
    playReferenceTone,
    playChord,
  };
}
