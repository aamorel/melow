import { database } from '../../services/database';
import { GAME_LEVELS } from '../../utils/constants';

export function ProgressChart() {
  const sessions = database.getSessions();
  const averagesByLevel = database.getAverageAccuracyByLevel();

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md text-center">
        <p className="text-gray-600">No sessions recorded yet. Start playing to see your progress!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Sessions:</span>
          <span className="text-2xl font-bold text-blue-600">{sessions.length}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium">Overall Accuracy:</span>
          <span className="text-2xl font-bold text-green-600">
            {(sessions.reduce((sum, s) => sum + s.accuracy_percentage, 0) / sessions.length).toFixed(1)}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium">Average Response Time:</span>
          <span className="text-2xl font-bold text-purple-600">
            {(sessions.reduce((sum, s) => sum + s.average_response_time, 0) / sessions.length / 1000).toFixed(1)}s
          </span>
        </div>
      </div>

      <h4 className="font-medium mb-3">Accuracy by Level:</h4>
      <div className="space-y-2">
        {GAME_LEVELS.map((level) => {
          const accuracy = averagesByLevel[level.id];
          const sessionsCount = database.getSessionsByLevel(level.id).length;
          
          return (
            <div key={level.id} className="flex items-center justify-between">
              <span className="text-sm">Level {level.id}: {level.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${accuracy || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12">
                  {accuracy ? `${accuracy.toFixed(0)}%` : 'N/A'}
                </span>
                <span className="text-xs text-gray-500 w-8">
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