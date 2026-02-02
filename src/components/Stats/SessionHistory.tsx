import type { ExerciseType } from '../../types/exercise';
import { database } from '../../services/database';
import { GAME_LEVELS } from '../../utils/constants';

type LevelMeta = {
  id: number;
  name: string;
};

interface SessionHistoryProps {
  exerciseType?: ExerciseType;
  levels?: LevelMeta[];
}

export function SessionHistory({ exerciseType, levels = GAME_LEVELS }: SessionHistoryProps) {
  const sessions = database.getSessions(exerciseType)
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
    .slice(0, 10); // Show last 10 sessions

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="text-slate-400">No sessions yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <h3 className="text-xl font-semibold mb-4">Recent Sessions</h3>
      
      <div className="space-y-3">
        {sessions.map((session) => {
          const level = levels.find(l => l.id === session.level);
          const date = new Date(session.created_at!);
          
          return (
            <div key={session.id} className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">
                    Level {session.level}: {level?.name}
                  </h4>
                  <p className="text-sm text-slate-400 capitalize">
                    {session.instrument}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-emerald-300">
                    {session.correct_answers}/{session.total_questions}
                  </p>
                  <p className="text-slate-400">Correct</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-cyan-300">
                    {session.accuracy_percentage.toFixed(1)}%
                  </p>
                  <p className="text-slate-400">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-amber-300">
                    {(session.average_response_time / 1000).toFixed(1)}s
                  </p>
                  <p className="text-slate-400">Avg Time</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
