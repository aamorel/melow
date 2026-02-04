import type { GameLevel, Interval } from '../types/game';
import type { PitchLevel } from '../types/pitch';
import type { ChordLevel, ChordQuality } from '../types/chord';

export const INTERVALS: Record<Interval, { name: string; semitones: number }> = {
  unison: { name: 'Unison', semitones: 0 },
  minor2nd: { name: 'Minor 2nd', semitones: 1 },
  major2nd: { name: 'Major 2nd', semitones: 2 },
  minor3rd: { name: 'Minor 3rd', semitones: 3 },
  major3rd: { name: 'Major 3rd', semitones: 4 },
  perfect4th: { name: 'Perfect 4th', semitones: 5 },
  tritone: { name: 'Tritone', semitones: 6 },
  perfect5th: { name: 'Perfect 5th', semitones: 7 },
  minor6th: { name: 'Minor 6th', semitones: 8 },
  major6th: { name: 'Major 6th', semitones: 9 },
  minor7th: { name: 'Minor 7th', semitones: 10 },
  major7th: { name: 'Major 7th', semitones: 11 },
  octave: { name: 'Octave', semitones: 12 },
};

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const CHORD_QUALITIES: Record<ChordQuality, { name: string; intervals: number[] }> = {
  major: { name: 'Major', intervals: [0, 4, 7] },
  minor: { name: 'Minor', intervals: [0, 3, 7] },
  diminished: { name: 'Diminished', intervals: [0, 3, 6] },
  augmented: { name: 'Augmented', intervals: [0, 4, 8] },
  major7: { name: 'Major 7', intervals: [0, 4, 7, 11] },
  minor7: { name: 'Minor 7', intervals: [0, 3, 7, 10] },
  dominant7: { name: 'Dominant 7', intervals: [0, 4, 7, 10] },
  major9: { name: 'Major 9', intervals: [0, 4, 7, 11, 14] },
  minor9: { name: 'Minor 9', intervals: [0, 3, 7, 10, 14] },
  dominant9: { name: 'Dominant 9', intervals: [0, 4, 7, 10, 14] },
  sus2: { name: 'Sus 2', intervals: [0, 2, 7] },
  sus4: { name: 'Sus 4', intervals: [0, 5, 7] },
  add2: { name: 'Add 2', intervals: [0, 2, 4, 7] },
  add9: { name: 'Add 9', intervals: [0, 4, 7, 14] },
};

export const GAME_LEVELS: GameLevel[] = [
  {
    id: 1,
    name: 'Beginner',
    description: 'Major scale intervals from C',
    intervals: ['unison', 'major2nd', 'major3rd', 'perfect4th', 'perfect5th', 'major6th', 'major7th', 'octave'],
    startingNotes: ['C'],
    octaveRange: [4, 4],
    mixedInstruments: false,
  },
  {
    id: 2,
    name: 'Minor Intervals',
    description: 'Add minor intervals',
    intervals: ['unison', 'minor2nd', 'major2nd', 'minor3rd', 'major3rd', 'perfect4th', 'perfect5th', 'minor6th', 'major6th', 'minor7th', 'major7th', 'octave'],
    startingNotes: ['C'],
    octaveRange: [4, 4],
    mixedInstruments: false,
  },
  {
    id: 3,
    name: 'Random Starting Notes',
    description: 'All intervals from different starting notes',
    intervals: ['unison', 'minor2nd', 'major2nd', 'minor3rd', 'major3rd', 'perfect4th', 'perfect5th', 'minor6th', 'major6th', 'minor7th', 'major7th', 'octave'],
    startingNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    octaveRange: [4, 4],
    mixedInstruments: false,
  },
  {
    id: 4,
    name: 'Extended Range',
    description: 'Multiple octaves',
    intervals: ['unison', 'minor2nd', 'major2nd', 'minor3rd', 'major3rd', 'perfect4th', 'perfect5th', 'minor6th', 'major6th', 'minor7th', 'major7th', 'octave'],
    startingNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    octaveRange: [3, 5],
    mixedInstruments: false,
  },
  {
    id: 5,
    name: 'Chromatic',
    description: 'All 12 intervals including tritone',
    intervals: ['unison', 'minor2nd', 'major2nd', 'minor3rd', 'major3rd', 'perfect4th', 'tritone', 'perfect5th', 'minor6th', 'major6th', 'minor7th', 'major7th', 'octave'],
    startingNotes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    octaveRange: [3, 5],
    mixedInstruments: false,
  },
  {
    id: 6,
    name: 'Mixed Instruments',
    description: 'Different instruments for each note',
    intervals: ['unison', 'minor2nd', 'major2nd', 'minor3rd', 'major3rd', 'perfect4th', 'tritone', 'perfect5th', 'minor6th', 'major6th', 'minor7th', 'major7th', 'octave'],
    startingNotes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    octaveRange: [3, 5],
    mixedInstruments: true,
  },
  {
    id: 7,
    name: 'Expert',
    description: 'All features unlocked',
    intervals: ['unison', 'minor2nd', 'major2nd', 'minor3rd', 'major3rd', 'perfect4th', 'tritone', 'perfect5th', 'minor6th', 'major6th', 'minor7th', 'major7th', 'octave'],
    startingNotes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    octaveRange: [2, 6],
    mixedInstruments: true,
  },
];

export const CHORD_LEVELS: ChordLevel[] = [
  {
    id: 1,
    name: 'Triad Qualities',
    description: 'Identify major, minor, diminished, and augmented triads.',
    chords: ['major', 'minor', 'diminished', 'augmented'],
    startingNotes: ['C', 'F', 'G'],
    octaveRange: [3, 4],
    mixedInstruments: false,
  },
  {
    id: 2,
    name: 'Extended Colors',
    description: '7ths, 9ths, suspended, and add chords across all keys.',
    chords: ['major7', 'minor7', 'dominant7', 'major9', 'minor9', 'dominant9', 'sus2', 'sus4', 'add2', 'add9'],
    startingNotes: NOTES,
    octaveRange: [3, 4],
    mixedInstruments: false,
  },
];

export const PITCH_LEVELS: PitchLevel[] = [
  {
    id: 1,
    name: 'Starter Notes',
    description: 'Sing back simple notes within one octave.',
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    octaveRange: [3, 3],
  },
];

export const INSTRUMENTS = ['piano', 'saxophone', 'guitar', 'flute', 'violin', 'voice'] as const;

export const ANSWER_FEEDBACK_TIMINGS = {
  correctMs: 650,
  incorrectMs: 1200,
  revealCorrectMs: 420,
} as const;
