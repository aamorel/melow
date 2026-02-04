import type { ReactNode } from 'react';
import type { Instrument } from '../../types/game';
import { Button } from '../UI/Button';

export interface SessionLevelOption {
  id: number;
  name: string;
}

export interface SessionInstrumentOption {
  id: Instrument;
  label: string;
  description: string;
  icon: ReactNode;
}

export const SESSION_INSTRUMENTS: SessionInstrumentOption[] = [
  {
    id: 'piano',
    label: 'Piano',
    description: 'Classic keys',
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="12" width="36" height="24" rx="4" />
        <path d="M16 12v16M24 12v16M32 12v16" />
        <path d="M20 28h8" />
      </svg>
    ),
  },
  {
    id: 'saxophone',
    label: 'Sax',
    description: 'Warm reed',
    icon: (
      <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M30 6c-4 6-2 12 2 18-4 1-6 4-6 8 0 6-4 10-10 10" />
        <path d="M22 12l6 6" />
        <circle cx="18" cy="32" r="2" />
        <circle cx="22" cy="36" r="2" />
        <circle cx="26" cy="40" r="2" />
      </svg>
    ),
  },
];

interface SessionSetupProps {
  title: string;
  levels: SessionLevelOption[];
  selectedLevel: number;
  onLevelChange: (level: number) => void;
  instruments: SessionInstrumentOption[];
  selectedInstrument: Instrument;
  onInstrumentChange: (instrument: Instrument) => void;
  detailItems: string[];
  onStart: () => void;
  disabled?: boolean;
  badge?: string;
  kicker?: string;
  levelTitle?: string;
  levelHint?: string;
  instrumentTitle?: string;
  instrumentHint?: string;
  detailTitle?: string;
  startLabel?: string;
}

export function SessionSetup({
  title,
  levels,
  selectedLevel,
  onLevelChange,
  instruments,
  selectedInstrument,
  onInstrumentChange,
  detailItems,
  onStart,
  disabled = false,
  badge = '10 questions',
  kicker = 'Session setup',
  levelTitle = 'Level',
  levelHint = 'Choose a focus',
  instrumentTitle = 'Instrument',
  instrumentHint = 'Select a timbre',
  detailTitle = 'Level details',
  startLabel = 'Begin session',
}: SessionSetupProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />

      <div className="relative space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{kicker}</p>
            <h2 className="text-2xl font-semibold">{title}</h2>
          </div>
          {badge && (
            <span className="rounded-full border border-slate-700/80 bg-slate-950/40 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
              {badge}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-200">{levelTitle}</p>
            <p className="text-xs text-slate-400">{levelHint}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {levels.map((level) => {
              const isSelected = selectedLevel === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => onLevelChange(level.id)}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  className={`group relative rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-cyan-400/80 bg-slate-950/70 shadow-[0_0_0_1px_rgba(34,211,238,0.2),0_20px_40px_rgba(0,0,0,0.35)]'
                      : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-600/80 hover:bg-slate-900/80'
                  } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <div className="relative text-[11px] uppercase tracking-[0.25em] text-slate-500">
                    <span>Level {level.id}</span>
                    {isSelected && (
                      <span className="absolute right-0 top-0 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2 py-0.5 text-[10px] tracking-[0.2em] text-cyan-200">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-base font-semibold text-slate-100">{level.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-200">{instrumentTitle}</p>
            <p className="text-xs text-slate-400">{instrumentHint}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {instruments.map((instrument) => {
              const isSelected = selectedInstrument === instrument.id;
              return (
                <button
                  key={instrument.id}
                  type="button"
                  onClick={() => onInstrumentChange(instrument.id)}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  className={`group flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-emerald-400/70 bg-slate-950/70 shadow-[0_0_0_1px_rgba(52,211,153,0.2),0_18px_36px_rgba(0,0,0,0.35)]'
                      : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-600/80 hover:bg-slate-900/80'
                  } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-slate-200 ${
                      isSelected
                        ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                        : 'border-slate-700/70 bg-slate-950/50'
                    }`}
                  >
                    {instrument.icon}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-100">{instrument.label}</p>
                    <p className="text-xs text-slate-400">{instrument.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
          <h4 className="text-sm font-medium text-slate-200">{detailTitle}</h4>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
            {detailItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <Button
          onClick={onStart}
          disabled={disabled}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {startLabel}
        </Button>
      </div>
    </div>
  );
}
