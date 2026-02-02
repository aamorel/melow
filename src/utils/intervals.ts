import type { Note, Interval } from '../types';
import { NOTES, INTERVALS } from './constants';

export function noteToFrequency(note: string, octave: number): number {
  const A4 = 440;
  const noteIndex = NOTES.indexOf(note);
  const semitonesFromA4 = (octave - 4) * 12 + (noteIndex - 9);
  return A4 * Math.pow(2, semitonesFromA4 / 12);
}

export function createNote(note: string, octave: number): Note {
  return {
    note,
    octave,
    frequency: noteToFrequency(note, octave),
  };
}

export function getTargetNote(startingNote: Note, interval: Interval): Note {
  const semitones = INTERVALS[interval].semitones;
  const startingIndex = NOTES.indexOf(startingNote.note);
  const totalSemitones = startingIndex + semitones;
  
  const targetNoteIndex = totalSemitones % 12;
  const octaveOffset = Math.floor(totalSemitones / 12);
  const targetOctave = startingNote.octave + octaveOffset;
  
  return createNote(NOTES[targetNoteIndex], targetOctave);
}

export function calculateInterval(note1: Note, note2: Note): Interval {
  const semitones1 = NOTES.indexOf(note1.note) + note1.octave * 12;
  const semitones2 = NOTES.indexOf(note2.note) + note2.octave * 12;
  const intervalSemitones = Math.abs(semitones2 - semitones1) % 12;
  
  const interval = Object.entries(INTERVALS).find(
    ([, info]) => info.semitones === intervalSemitones
  );
  
  return interval ? (interval[0] as Interval) : 'unison';
}

export function getRandomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomNote(noteNames: string[], octaveRange: [number, number]): Note {
  const note = getRandomElement(noteNames);
  const octave = Math.floor(Math.random() * (octaveRange[1] - octaveRange[0] + 1)) + octaveRange[0];
  return createNote(note, octave);
}

export function noteToMidi(note: Note): number {
  return (note.octave + 1) * 12 + NOTES.indexOf(note.note);
}

export function transposeNote(note: Note, semitoneOffset: number): Note {
  return midiToNote(noteToMidi(note) + semitoneOffset);
}

export function noteNameToMidi(noteName: string, octave: number): number {
  return (octave + 1) * 12 + NOTES.indexOf(noteName);
}

export function midiToNote(midi: number): Note {
  const normalizedMidi = Math.max(0, Math.round(midi));
  const noteIndex = normalizedMidi % 12;
  const octave = Math.floor(normalizedMidi / 12) - 1;
  return createNote(NOTES[noteIndex], octave);
}

export function frequencyToNoteData(frequency: number) {
  if (!Number.isFinite(frequency) || frequency <= 0) {
    return null;
  }

  const midi = 69 + 12 * Math.log2(frequency / 440);
  if (!Number.isFinite(midi)) {
    return null;
  }

  const nearestMidi = Math.round(midi);
  const cents = (midi - nearestMidi) * 100;

  return {
    midi: nearestMidi,
    cents,
    note: midiToNote(nearestMidi),
  };
}
