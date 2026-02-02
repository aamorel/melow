import type { GameLevel, Interval } from '../types/game';
import type { PitchLevel } from '../types/pitch';

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
