export interface AggregatedStats {
  totalSessions: number;
  totalQuestions: number;
  accuracyPercentage: number;
  averageResponseTimeMs: number;
  lastSessionDate: string | null;
}
