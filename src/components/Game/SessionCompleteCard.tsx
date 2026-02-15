import { Button } from '../UI/Button';

interface SessionCompleteCardProps {
  correctAnswers: number;
  totalQuestions: number;
  accuracyPercent: number;
  averageTimeMs: number;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}

export function SessionCompleteCard({
  correctAnswers,
  totalQuestions,
  accuracyPercent,
  averageTimeMs,
  primaryLabel,
  secondaryLabel,
  onPrimaryAction,
  onSecondaryAction,
}: SessionCompleteCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <h2 className="mb-6 text-3xl font-semibold text-emerald-300">Session complete</h2>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4">
          <p className="text-2xl font-semibold text-emerald-300">
            {correctAnswers}/{totalQuestions}
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Correct</p>
        </div>
        <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4">
          <p className="text-2xl font-semibold text-cyan-300">
            {accuracyPercent.toFixed(1)}%
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Accuracy</p>
        </div>
        <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4">
          <p className="text-2xl font-semibold text-amber-300">
            {(averageTimeMs / 1000).toFixed(1)}s
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Avg Time</p>
        </div>
      </div>

      <div className="space-y-3">
        <Button onClick={onPrimaryAction} variant="primary" size="lg" className="w-full md:w-auto">
          {primaryLabel}
        </Button>
        <Button onClick={onSecondaryAction} variant="secondary" size="lg" className="ml-0 w-full md:ml-3 md:w-auto">
          {secondaryLabel}
        </Button>
      </div>
    </div>
  );
}
