import type { ChordLevel, ChordQuestion, ChordQuality } from '../types/chord';
import type { Instrument } from '../types/game';
import { getRandomElement, getRandomNote, transposeNote } from '../utils/intervals';
import { CHORD_QUALITIES, INSTRUMENTS } from '../utils/constants';

export class ChordGenerator {
  generateQuestions(level: ChordLevel, instrument: Instrument, count = 10): ChordQuestion[] {
    const questions: ChordQuestion[] = [];

    for (let i = 0; i < count; i++) {
      const chordQuality = getRandomElement(level.chords);
      const rootNote = getRandomNote(level.startingNotes, level.octaveRange);
      const intervals = CHORD_QUALITIES[chordQuality].intervals;
      const notes = intervals.map(semitones => transposeNote(rootNote, semitones));

      const questionInstrument = level.mixedInstruments
        ? getRandomElement(INSTRUMENTS)
        : instrument;

      questions.push({
        id: i + 1,
        rootNote,
        chordQuality,
        notes,
        instrument: questionInstrument,
      });
    }

    return questions;
  }

  validateAnswer(question: ChordQuestion, userAnswer: ChordQuality): boolean {
    return question.chordQuality === userAnswer;
  }
}

export const chordGenerator = new ChordGenerator();
