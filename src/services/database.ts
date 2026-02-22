import type { SessionRecord, AnswerRecord, SettingsRecord } from '../types/database';
import type { GameSession } from '../types/game';
import type { PitchSession } from '../types/pitch';
import type { ChordSession } from '../types/chord';
import type { ScaleSession } from '../types/scale';
import type { ExerciseType } from '../types/exercise';
import { frequencyToNoteData } from '../utils/intervals';

// For now, we'll use localStorage as a simple database
// Later we can replace this with better-sqlite3 when we add Node.js backend

export class DatabaseService {
  private readonly SESSIONS_KEY = 'melow_sessions';
  private readonly ANSWERS_KEY = 'melow_answers';
  private readonly SETTINGS_KEY = 'melow_settings';

  private normalizeSessionRecord(record: SessionRecord): SessionRecord {
    return {
      ...record,
      exercise_type: record.exercise_type ?? 'listening',
    };
  }

  private saveSessionRecord<TQuestion, TAnswer extends { isCorrect: boolean; responseTimeMs: number }>(
    exerciseType: ExerciseType,
    session: {
      level: number;
      instrument: string;
      questions: TQuestion[];
      answers: TAnswer[];
    },
    buildAnswerRecord: (question: TQuestion, answer: TAnswer, index: number) => Partial<AnswerRecord>
  ): number {
    const sessions = this.getSessions();
    const correctAnswers = session.answers.filter(a => a.isCorrect).length;
    const totalAnswers = session.answers.length;
    const averageResponseTime = totalAnswers > 0
      ? session.answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / totalAnswers
      : 0;
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

    const sessionRecord: SessionRecord = {
      id: Date.now() + Math.random() * 1000,
      exercise_type: exerciseType,
      level: session.level,
      instrument: session.instrument,
      total_questions: session.questions.length,
      correct_answers: correctAnswers,
      average_response_time: averageResponseTime,
      accuracy_percentage: accuracy,
      created_at: new Date().toISOString(),
    };

    sessions.push(sessionRecord);
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));

    const answers = this.getAnswers();
    session.answers.forEach((answer, index) => {
      const answerRecord: AnswerRecord = {
        id: Date.now() + Math.random() * 1000 + index,
        session_id: sessionRecord.id!,
        exercise_type: exerciseType,
        question_number: index + 1,
        starting_note: null,
        correct_interval: null,
        user_answer: null,
        is_correct: answer.isCorrect,
        response_time_ms: answer.responseTimeMs,
        created_at: new Date().toISOString(),
        ...buildAnswerRecord(session.questions[index], answer, index),
      };
      answers.push(answerRecord);
    });
    localStorage.setItem(this.ANSWERS_KEY, JSON.stringify(answers));

    return sessionRecord.id!;
  }

  async saveSession(session: GameSession): Promise<number> {
    return this.saveListeningSession(session);
  }

  async saveListeningSession(session: GameSession): Promise<number> {
    return this.saveSessionRecord('listening', session, (question, answer) => ({
      starting_note: `${question.startingNote.note}${question.startingNote.octave}`,
      correct_interval: question.correctInterval,
      user_answer: answer.userAnswer,
    }));
  }

  async savePitchSession(session: PitchSession): Promise<number> {
    return this.saveSessionRecord('pitch', session, (question, answer) => {
      const targetNote = `${question.targetNote.note}${question.targetNote.octave}`;
      const detectedNote = answer.detectedFrequency
        ? frequencyToNoteData(answer.detectedFrequency)?.note
        : null;

      return {
        starting_note: targetNote,
        target_note: targetNote,
        user_answer: detectedNote ? `${detectedNote.note}${detectedNote.octave}` : null,
        detected_frequency: answer.detectedFrequency,
        cents_off: answer.centsOff,
      };
    });
  }

  async saveChordSession(session: ChordSession): Promise<number> {
    return this.saveSessionRecord('chords', session, (question, answer) => ({
      starting_note: `${question.rootNote.note}${question.rootNote.octave}`,
      correct_interval: question.chordQuality,
      user_answer: answer.userAnswer,
    }));
  }

  async saveScaleSession(session: ScaleSession): Promise<number> {
    return this.saveSessionRecord('scales', session, (question, answer) => ({
      starting_note: `${question.rootNote.note}${question.rootNote.octave}`,
      correct_interval: question.scaleType,
      user_answer: answer.userAnswer,
    }));
  }

  getSessions(exerciseType?: ExerciseType): SessionRecord[] {
    const stored = localStorage.getItem(this.SESSIONS_KEY);
    const sessions: SessionRecord[] = stored ? JSON.parse(stored) : [];
    const normalized = sessions.map(session => this.normalizeSessionRecord(session));
    return exerciseType ? normalized.filter(session => session.exercise_type === exerciseType) : normalized;
  }

  getAnswers(exerciseType?: ExerciseType): AnswerRecord[] {
    const stored = localStorage.getItem(this.ANSWERS_KEY);
    const answers: AnswerRecord[] = stored ? JSON.parse(stored) : [];
    return exerciseType ? answers.filter(answer => answer.exercise_type === exerciseType) : answers;
  }

  getSessionsByLevel(level: number, exerciseType?: ExerciseType): SessionRecord[] {
    return this.getSessions(exerciseType).filter(session => session.level === level);
  }

  getSettings(): SettingsRecord {
    const stored = localStorage.getItem(this.SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    const defaultSettings: SettingsRecord = {
      id: 1,
      preferred_instrument: 'piano',
      default_level: 1,
      audio_volume: 0.7,
      updated_at: new Date().toISOString(),
    };
    
    this.saveSettings(defaultSettings);
    return defaultSettings;
  }

  saveSettings(settings: SettingsRecord): void {
    settings.updated_at = new Date().toISOString();
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  getAverageAccuracyByLevel(exerciseType?: ExerciseType): Record<number, number> {
    const sessions = this.getSessions(exerciseType);
    const levelGroups: Record<number, number[]> = {};
    
    sessions.forEach(session => {
      if (!levelGroups[session.level]) {
        levelGroups[session.level] = [];
      }
      levelGroups[session.level].push(session.accuracy_percentage);
    });

    const averages: Record<number, number> = {};
    Object.entries(levelGroups).forEach(([level, accuracies]) => {
      averages[parseInt(level)] = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    });

    return averages;
  }

  getProgressOverTime(level?: number, exerciseType?: ExerciseType): { date: string; accuracy: number; responseTime: number }[] {
    let sessions = this.getSessions(exerciseType);
    if (level !== undefined) {
      sessions = sessions.filter(s => s.level === level);
    }

    return sessions
      .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())
      .map(session => ({
        date: session.created_at!.split('T')[0],
        accuracy: session.accuracy_percentage,
        responseTime: session.average_response_time,
      }));
  }
}

export const database = new DatabaseService();
