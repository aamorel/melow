import { useState } from 'react';
import { Layout } from './components/UI/Layout';
import { Button } from './components/UI/Button';
import { ListeningExercise } from './features/listening/ListeningExercise';

type ExerciseId = 'listening';

interface ExerciseDefinition {
  id: ExerciseId;
  name: string;
  description: string;
}

const EXERCISES: ExerciseDefinition[] = [
  {
    id: 'listening',
    name: 'Listening',
    description: 'Identify intervals by ear through guided exercises.',
  },
];

function App() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseId | null>(null);
  const activeExercise = EXERCISES.find(exercise => exercise.id === selectedExercise) ?? null;

  return (
    <Layout>
      {activeExercise ? (
        activeExercise.id === 'listening' ? (
          <ListeningExercise onBack={() => setSelectedExercise(null)} />
        ) : null
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <h2 className="text-2xl font-bold mb-2">Choose an exercise to begin</h2>
            <p className="text-gray-600">
              Select a training mode below. We&apos;ll add more exercise types soon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EXERCISES.map((exercise) => (
              <div key={exercise.id} className="bg-white rounded-lg p-6 shadow-md flex flex-col gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{exercise.name}</h3>
                  <p className="text-gray-600 text-sm">{exercise.description}</p>
                </div>
                <Button
                  onClick={() => setSelectedExercise(exercise.id)}
                  variant="primary"
                  className="w-full"
                >
                  Start {exercise.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
