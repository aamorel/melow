import type { Instrument, Note } from './game';

export type ScaleType =
  | 'major'
  | 'naturalMinor'
  | 'harmonicMinor'
  | 'melodicMinor'
  | 'dorian'
  | 'mixolydian';

export type ScaleLevel = {
  id: number;
  name: string;
  description: string;
  scales: ScaleType[];
  startingNotes: string[];
  octaveRange: [number, number];
  mixedInstruments?: boolean;
};

export type ScaleQuestion = {
  id: number;
  rootNote: Note;
  scaleType: ScaleType;
  notes: Note[];
  instrument: Instrument;
};

export type ScaleAnswer = {
  questionId: number;
  userAnswer: ScaleType | null;
  isCorrect: boolean;
  responseTimeMs: number;
};

export type ScaleSession = {
  id?: number;
  level: number;
  instrument: Instrument;
  questions: ScaleQuestion[];
  answers: ScaleAnswer[];
  startTime: number;
  endTime?: number;
};

export type ScaleGameState = {
  currentSession: ScaleSession | null;
  currentQuestionIndex: number;
  showResult: boolean;
  selectedLevel: number;
  selectedInstrument: Instrument;
};
