export type Interval = 
  | 'unison'
  | 'minor2nd'
  | 'major2nd'
  | 'minor3rd'
  | 'major3rd'
  | 'perfect4th'
  | 'tritone'
  | 'perfect5th'
  | 'minor6th'
  | 'major6th'
  | 'minor7th'
  | 'major7th'
  | 'octave';

export type Instrument = 'piano' | 'saxophone' | 'guitar' | 'flute' | 'violin';

export type Note = {
  note: string;
  octave: number;
  frequency: number;
};

export type GameLevel = {
  id: number;
  name: string;
  description: string;
  intervals: Interval[];
  startingNotes: string[];
  octaveRange: [number, number];
  mixedInstruments: boolean;
};

export type Question = {
  id: number;
  startingNote: Note;
  targetNote: Note;
  correctInterval: Interval;
  instrument: Instrument;
};

export type Answer = {
  questionId: number;
  userAnswer: Interval | null;
  isCorrect: boolean;
  responseTimeMs: number;
};

export type GameSession = {
  id?: number;
  level: number;
  instrument: Instrument;
  questions: Question[];
  answers: Answer[];
  startTime: number;
  endTime?: number;
};

export type GameState = {
  currentSession: GameSession | null;
  currentQuestionIndex: number;
  isPlaying: boolean;
  showResult: boolean;
  selectedLevel: number;
  selectedInstrument: Instrument;
};