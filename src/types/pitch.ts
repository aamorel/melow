import type { Instrument, Note } from './game';

export type PitchLevel = {
  id: number;
  name: string;
  description: string;
  notes: string[];
  octaveRange: [number, number];
};

export type PitchQuestion = {
  id: number;
  targetNote: Note;
};

export type PitchAnswer = {
  questionId: number;
  detectedFrequency: number | null;
  centsOff: number | null;
  isCorrect: boolean;
  responseTimeMs: number;
};

export type PitchSession = {
  id?: number;
  level: number;
  instrument: Instrument;
  questions: PitchQuestion[];
  answers: PitchAnswer[];
  startTime: number;
  endTime?: number;
};

export type PitchGameState = {
  currentSession: PitchSession | null;
  currentQuestionIndex: number;
  showResult: boolean;
  selectedLevel: number;
  selectedInstrument: Instrument;
};
