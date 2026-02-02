import type { ExerciseType } from '../../types/exercise';
import { database } from '../../services/database';
import { GAME_LEVELS } from '../../utils/constants';

type LevelMeta = {
  id: number;
  name: string;
};

interface ProgressChartProps {
  exerciseType?: ExerciseType;
  levels?: LevelMeta[];
}

export function ProgressChart({ exerciseType, levels = GAME_LEVELS }: ProgressChartProps) {
  const sessions = database.getSessions(exerciseType);
  const averagesByLevel = database.getAverageAccuracyByLevel(exerciseType);

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="text-slate-400">No sessions yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <h3 className="text-xl font-semibold mb-4">Progress</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-300">Total Sessions</span>
          <span className="text-2xl font-bold text-cyan-300">{sessions.length}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-300">Overall Accuracy</span>
          <span className="text-2xl font-bold text-emerald-300">
            {(sessions.reduce((sum, s) => sum + s.accuracy_percentage, 0) / sessions.length).toFixed(1)}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-300">Average Response Time</span>
          <span className="text-2xl font-bold text-amber-300">
            {(sessions.reduce((sum, s) => sum + s.average_response_time, 0) / sessions.length / 1000).toFixed(1)}s
          </span>
        </div>
      </div>

      <h4 className="font-medium mb-3 text-slate-200">Accuracy by level</h4>
      <div className="space-y-2">
        {levels.map((level) => {
          const accuracy = averagesByLevel[level.id];
          const sessionsCount = database.getSessionsByLevel(level.id, exerciseType).length;
          
          return (
            <div key={level.id} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Level {level.id}: {level.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-slate-800/80 rounded-full h-2">
                  <div 
                    className="bg-cyan-400 h-2 rounded-full"
                    style={{ width: `${accuracy || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-slate-400 w-12">
                  {accuracy ? `${accuracy.toFixed(0)}%` : 'N/A'}
                </span>
                <span className="text-xs text-slate-500 w-8">
                  ({sessionsCount})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
