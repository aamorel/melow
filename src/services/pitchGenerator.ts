import type { PitchLevel, PitchQuestion } from '../types/pitch';
import { getRandomNote } from '../utils/intervals';

export class PitchGenerator {
  generateQuestions(level: PitchLevel, count = 10): PitchQuestion[] {
    const questions: PitchQuestion[] = [];

    for (let i = 0; i < count; i++) {
      const targetNote = getRandomNote(level.notes, level.octaveRange);
      questions.push({
        id: i + 1,
        targetNote,
      });
    }

    return questions;
  }
}

export const pitchGenerator = new PitchGenerator();
