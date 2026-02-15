import { useState } from 'react';
import { Layout } from './components/UI/Layout';
import { AccountSidePanel } from './components/UI/AccountSidePanel';
import { HeadphoneScene } from './components/UI/HeadphoneScene';
import { Button } from './components/UI/Button';
import { ListeningExercise } from './features/listening/ListeningExercise';
import { PitchExercise } from './features/pitch/PitchExercise';
import { ChordExercise } from './features/chords/ChordExercise';

type ExerciseId = 'listening' | 'pitch' | 'chords';

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
    accent: 'from-amber-300/90 to-orange-400/80',
    icon: 'L',
  },
  {
    id: 'chords',
    name: 'Chords',
    tags: ['Harmony', 'Quality'],
    accent: 'from-rose-300/90 to-amber-400/80',
    icon: 'C',
  },
  {
    id: 'pitch',
    name: 'Pitch Match',
    tags: ['Voice', 'Accuracy'],
    accent: 'from-orange-300/90 to-amber-500/80',
    icon: 'P',
  },
];

function App() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseId | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const activeExercise = EXERCISES.find(exercise => exercise.id === selectedExercise) ?? null;

  return (
    <Layout
      headerActions={(
        <Button
          type="button"
          onClick={() => setIsAccountOpen((prev) => !prev)}
          aria-label={isAccountOpen ? 'Hide profile panel' : 'Show profile panel'}
          variant="ghost"
          size="icon"
          className={`rounded-2xl text-sm font-semibold text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.3)] ${
            isAccountOpen
              ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100 hover:border-cyan-300/70 hover:bg-cyan-500/20'
              : 'border-slate-800/80 bg-slate-900/70 hover:border-slate-600 hover:text-white'
          }`}
        >
          DL
        </Button>
      )}
    >
      <div className="grid gap-8">
        <div>
          {activeExercise ? (
            activeExercise.id === 'listening' ? (
              <ListeningExercise onBack={() => setSelectedExercise(null)} />
            ) : activeExercise.id === 'chords' ? (
              <ChordExercise onBack={() => setSelectedExercise(null)} />
            ) : activeExercise.id === 'pitch' ? (
              <PitchExercise onBack={() => setSelectedExercise(null)} />
            ) : null
          ) : (
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-semibold tracking-tight">Exercises</h2>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 stagger-fade">
                  {EXERCISES.map((exercise) => (
                    <button
                      key={exercise.id}
                      type="button"
                      onClick={() => setSelectedExercise(exercise.id)}
                      aria-label={`Open ${exercise.name}`}
                      onMouseMove={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        const x = event.clientX - rect.left;
                        const y = event.clientY - rect.top;
                        event.currentTarget.style.setProperty('--glow-x', `${x}px`);
                        event.currentTarget.style.setProperty('--glow-y', `${y}px`);
                      }}
                      className="group relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.32)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-700/80 hover:bg-slate-900/80"
                    >
                      <div
                        className="absolute inset-0 opacity-0 transition duration-200 group-hover:opacity-100"
                        style={{
                          background:
                            'radial-gradient(360px circle at var(--glow-x, 50%) var(--glow-y, 20%), rgba(251,191,36,0.12), transparent 60%)',
                        }}
                      ></div>

                      <div className="relative flex h-full flex-col justify-between gap-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br ${exercise.accent} text-base font-semibold text-slate-950`}>
                              {exercise.icon}
                            </div>
                            <h3 className="mt-3 text-xl font-semibold">{exercise.name}</h3>
                          </div>
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/70 text-xs text-slate-300 transition group-hover:border-slate-500 group-hover:text-white">
                            &rarr;
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {exercise.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-slate-800/80 bg-slate-900/70 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-400"
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
              <div className="lg:pt-6">
                <HeadphoneScene />
              </div>
            </div>
          )}
        </div>
        <div
          className={`fixed inset-0 z-40 transition ${isAccountOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          aria-hidden={!isAccountOpen}
        >
          <button
            type="button"
            aria-label="Close profile panel"
            onClick={() => setIsAccountOpen(false)}
            className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ${
              isAccountOpen ? 'opacity-100' : 'opacity-0'
            }`}
          ></button>
          <div
            className={`absolute right-0 top-0 flex h-full w-[320px] max-w-[85vw] flex-col border-l border-slate-800/80 bg-slate-950/85 shadow-[0_30px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-transform duration-300 ease-out ${
              isAccountOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            role="dialog"
            aria-label="Account panel"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Account</p>
                <h2 className="text-lg font-semibold text-slate-100">Profile overview</h2>
              </div>
              <Button
                type="button"
                onClick={() => setIsAccountOpen(false)}
                aria-label="Hide profile panel"
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                &rarr;
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <AccountSidePanel />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
