import type { SessionRecord, AnswerRecord, SettingsRecord } from '../types/database';
import type { GameSession } from '../types/game';

// For now, we'll use localStorage as a simple database
// Later we can replace this with better-sqlite3 when we add Node.js backend

export class DatabaseService {
  private readonly SESSIONS_KEY = 'melow_sessions';
  private readonly ANSWERS_KEY = 'melow_answers';
  private readonly SETTINGS_KEY = 'melow_settings';

  async saveSession(session: GameSession): Promise<number> {
    const sessions = this.getSessions();
    const sessionRecord: SessionRecord = {
      id: Date.now() + Math.random() * 1000,
      level: session.level,
      instrument: session.instrument,
      total_questions: session.questions.length,
      correct_answers: session.answers.filter(a => a.isCorrect).length,
      average_response_time: session.answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / session.answers.length,
      accuracy_percentage: (session.answers.filter(a => a.isCorrect).length / session.answers.length) * 100,
      created_at: new Date().toISOString(),
    };

    sessions.push(sessionRecord);
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));

    // Save individual answers
    const answers = this.getAnswers();
    session.answers.forEach((answer, index) => {
      const answerRecord: AnswerRecord = {
        id: Date.now() + Math.random() * 1000 + index,
        session_id: sessionRecord.id!,
        question_number: index + 1,
        starting_note: `${session.questions[index].startingNote.note}${session.questions[index].startingNote.octave}`,
        correct_interval: session.questions[index].correctInterval,
        user_answer: answer.userAnswer,
        is_correct: answer.isCorrect,
        response_time_ms: answer.responseTimeMs,
        created_at: new Date().toISOString(),
      };
      answers.push(answerRecord);
    });
    localStorage.setItem(this.ANSWERS_KEY, JSON.stringify(answers));

    return sessionRecord.id!;
  }

  getSessions(): SessionRecord[] {
    const stored = localStorage.getItem(this.SESSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  getAnswers(): AnswerRecord[] {
    const stored = localStorage.getItem(this.ANSWERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  getSessionsByLevel(level: number): SessionRecord[] {
    return this.getSessions().filter(session => session.level === level);
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

  getAverageAccuracyByLevel(): Record<number, number> {
    const sessions = this.getSessions();
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

  getProgressOverTime(level?: number): { date: string; accuracy: number; responseTime: number }[] {
    let sessions = this.getSessions();
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