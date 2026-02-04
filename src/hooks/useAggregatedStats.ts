import type { AggregatedStats, ExerciseType, SessionRecord } from '../types';
import { database } from '../services/database';

const EMPTY_STATS: AggregatedStats = {
  totalSessions: 0,
  totalQuestions: 0,
  accuracyPercentage: 0,
  averageResponseTimeMs: 0,
  lastSessionDate: null,
};

type StatsAccumulator = {
  totalQuestions: number;
  totalCorrect: number;
  totalResponseTime: number;
  lastSessionDate: string | null;
};

function buildAggregatedStats(sessions: SessionRecord[]): AggregatedStats {
  if (sessions.length === 0) {
    return EMPTY_STATS;
  }

  const totals = sessions.reduce<StatsAccumulator>((accumulator, session) => {
    const totalQuestions = session.total_questions ?? 0;
    const correctAnswers = session.correct_answers ?? 0;
    const averageResponseTime = session.average_response_time ?? 0;

    accumulator.totalQuestions += totalQuestions;
    accumulator.totalCorrect += correctAnswers;
    accumulator.totalResponseTime += averageResponseTime * totalQuestions;

    if (session.created_at) {
      if (!accumulator.lastSessionDate) {
        accumulator.lastSessionDate = session.created_at;
      } else if (new Date(session.created_at).getTime() > new Date(accumulator.lastSessionDate).getTime()) {
        accumulator.lastSessionDate = session.created_at;
      }
    }

    return accumulator;
  }, {
    totalQuestions: 0,
    totalCorrect: 0,
    totalResponseTime: 0,
    lastSessionDate: null,
  });

  const accuracyPercentage = totals.totalQuestions > 0
    ? (totals.totalCorrect / totals.totalQuestions) * 100
    : 0;
  const averageResponseTimeMs = totals.totalQuestions > 0
    ? totals.totalResponseTime / totals.totalQuestions
    : 0;

  return {
    totalSessions: sessions.length,
    totalQuestions: totals.totalQuestions,
    accuracyPercentage,
    averageResponseTimeMs,
    lastSessionDate: totals.lastSessionDate,
  };
}

export function useAggregatedStats(exerciseType?: ExerciseType) {
  const sessions = database.getSessions(exerciseType);
  const computed = buildAggregatedStats(sessions);

  return {
    sessions,
    computed,
  };
}
