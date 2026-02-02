import type { Instrument, Note } from './game';

export type ChordQuality =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  | 'major7'
  | 'minor7'
  | 'dominant7'
  | 'major9'
  | 'minor9'
  | 'dominant9'
  | 'sus2'
  | 'sus4'
  | 'add2'
  | 'add9';

export type ChordLevel = {
  id: number;
  name: string;
  description: string;
  chords: ChordQuality[];
  startingNotes: string[];
  octaveRange: [number, number];
  mixedInstruments?: boolean;
};

export type ChordQuestion = {
  id: number;
  rootNote: Note;
  chordQuality: ChordQuality;
  notes: Note[];
  instrument: Instrument;
};

export type ChordAnswer = {
  questionId: number;
  userAnswer: ChordQuality | null;
  isCorrect: boolean;
  responseTimeMs: number;
};

export type ChordSession = {
  id?: number;
  level: number;
  instrument: Instrument;
  questions: ChordQuestion[];
  answers: ChordAnswer[];
  startTime: number;
  endTime?: number;
};

export type ChordGameState = {
  currentSession: ChordSession | null;
  currentQuestionIndex: number;
  showResult: boolean;
  selectedLevel: number;
  selectedInstrument: Instrument;
};
