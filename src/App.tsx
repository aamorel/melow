import { useState } from 'react';
import { Layout } from './components/UI/Layout';
import { ListeningExercise } from './features/listening/ListeningExercise';
import { PitchExercise } from './features/pitch/PitchExercise';

type ExerciseId = 'listening' | 'pitch';

interface ExerciseDefinition {
  id: ExerciseId;
  name: string;
  tags: string[];
  accent: string;
  icon: string;
}

const EXERCISES: ExerciseDefinition[] = [
  {
    id: 'listening',
    name: 'Listening',
    tags: ['Intervals', 'Memory'],
    accent: 'from-cyan-400/90 to-blue-500/80',
    icon: 'L',
  },
  {
    id: 'pitch',
    name: 'Pitch Match',
    tags: ['Voice', 'Accuracy'],
    accent: 'from-emerald-400/90 to-teal-500/80',
    icon: 'P',
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
        ) : activeExercise.id === 'pitch' ? (
          <PitchExercise onBack={() => setSelectedExercise(null)} />
        ) : null
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold tracking-tight">Exercises</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 stagger-fade">
            {EXERCISES.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => setSelectedExercise(exercise.id)}
                aria-label={`Open ${exercise.name}`}
                className="group relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition duration-200 hover:-translate-y-1 hover:border-slate-700/80 hover:bg-slate-900/80"
              >
                <div className="absolute inset-0 opacity-0 transition duration-200 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_55%)]"></div>

                <div className="relative flex h-full flex-col justify-between gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${exercise.accent} text-lg font-semibold text-slate-950`}>
                        {exercise.icon}
                      </div>
                      <h3 className="mt-4 text-2xl font-semibold">{exercise.name}</h3>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/70 text-sm text-slate-300 transition group-hover:border-slate-500 group-hover:text-white">
                      &rarr;
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {exercise.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-800/80 bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
