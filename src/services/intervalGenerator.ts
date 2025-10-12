import type { Question, GameLevel, Instrument, Interval } from '../types/game';
import { getRandomElement, getRandomNote, getTargetNote } from '../utils/intervals';
import { INSTRUMENTS } from '../utils/constants';

export class IntervalGenerator {
  generateQuestions(level: GameLevel, instrument: Instrument, count = 10): Question[] {
    const questions: Question[] = [];

    for (let i = 0; i < count; i++) {
      const interval = getRandomElement(level.intervals);
      const startingNote = getRandomNote(level.startingNotes, level.octaveRange);
      const targetNote = getTargetNote(startingNote, interval);
      
      // For mixed instruments mode, randomly choose instruments for each note
      const questionInstrument = level.mixedInstruments 
        ? getRandomElement(INSTRUMENTS) 
        : instrument;

      questions.push({
        id: i + 1,
        startingNote,
        targetNote,
        correctInterval: interval,
        instrument: questionInstrument,
      });
    }

    return questions;
  }

  validateAnswer(question: Question, userAnswer: Interval): boolean {
    return question.correctInterval === userAnswer;
  }
}

export const intervalGenerator = new IntervalGenerator();
