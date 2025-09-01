import { database } from '../../services/database';
import { GAME_LEVELS } from '../../utils/constants';

export function SessionHistory() {
  const sessions = database.getSessions()
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
    .slice(0, 10); // Show last 10 sessions

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md text-center">
        <p className="text-gray-600">No session history available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">Recent Sessions</h3>
      
      <div className="space-y-3">
        {sessions.map((session) => {
          const level = GAME_LEVELS.find(l => l.id === session.level);
          const date = new Date(session.created_at!);
          
          return (
            <div key={session.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">
                    Level {session.level}: {level?.name}
                  </h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {session.instrument}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-green-600">
                    {session.correct_answers}/{session.total_questions}
                  </p>
                  <p className="text-gray-600">Correct</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-blue-600">
                    {session.accuracy_percentage.toFixed(1)}%
                  </p>
                  <p className="text-gray-600">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-purple-600">
                    {(session.average_response_time / 1000).toFixed(1)}s
                  </p>
                  <p className="text-gray-600">Avg Time</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}