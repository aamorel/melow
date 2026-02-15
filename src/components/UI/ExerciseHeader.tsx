import type { ReactNode } from 'react';
import { Button } from './Button';

export type ExerciseView = 'training' | 'stats';

interface ExerciseHeaderProps {
  title: string;
  icon: ReactNode;
  iconClassName: string;
  currentView: ExerciseView;
  onViewChange: (view: ExerciseView) => void;
  onBack?: () => void;
  backAriaLabel?: string;
}

export function ExerciseHeader({
  title,
  icon,
  iconClassName,
  currentView,
  onViewChange,
  onBack,
  backAriaLabel = 'Back to exercises',
}: ExerciseHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-semibold text-slate-950 ${iconClassName}`}
        >
          {icon}
        </div>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <Button
            onClick={() => onViewChange('training')}
            variant={currentView === 'training' ? 'primary' : 'secondary'}
          >
            Training
          </Button>
          <Button
            onClick={() => onViewChange('stats')}
            variant={currentView === 'stats' ? 'primary' : 'secondary'}
          >
            Progress
          </Button>
        </div>

        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={backAriaLabel}
          >
            &larr;
          </Button>
        )}
      </div>
    </div>
  );
}
