import type { ScaleLevel, ScaleQuestion, ScaleType } from '../types/scale';
import type { Instrument } from '../types/game';
import { getRandomElement, getRandomNote, transposeNote } from '../utils/intervals';
import { INSTRUMENTS, SCALE_TYPES } from '../utils/constants';

export class ScaleGenerator {
  generateQuestions(level: ScaleLevel, instrument: Instrument, count = 10): ScaleQuestion[] {
    const questions: ScaleQuestion[] = [];

    for (let i = 0; i < count; i++) {
      const scaleType = getRandomElement(level.scales);
      const rootNote = getRandomNote(level.startingNotes, level.octaveRange);
      const intervals = SCALE_TYPES[scaleType].intervals;
      const notes = intervals.map(semitones => transposeNote(rootNote, semitones));

      const questionInstrument = level.mixedInstruments
        ? getRandomElement(INSTRUMENTS)
        : instrument;

      questions.push({
        id: i + 1,
        rootNote,
        scaleType,
        notes,
        instrument: questionInstrument,
      });
    }

    return questions;
  }

  validateAnswer(question: ScaleQuestion, userAnswer: ScaleType): boolean {
    return question.scaleType === userAnswer;
  }
}

export const scaleGenerator = new ScaleGenerator();
