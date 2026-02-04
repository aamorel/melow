import { useAggregatedStats } from '../../hooks/useAggregatedStats';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

export function AccountSidePanel() {
  const { computed } = useAggregatedStats();
  const hasSessions = computed.totalSessions > 0;

  const accuracyLabel = hasSessions
    ? `${computed.accuracyPercentage.toFixed(1)}%`
    : '—';
  const responseTimeLabel = hasSessions
    ? `${(computed.averageResponseTimeMs / 1000).toFixed(1)}s`
    : '—';
  const lastSessionLabel = computed.lastSessionDate
    ? DATE_FORMATTER.format(new Date(computed.lastSessionDate))
    : '—';

  const statCards = [
    { label: 'Sessions', value: computed.totalSessions, tone: 'text-cyan-300' },
    { label: 'Questions', value: computed.totalQuestions, tone: 'text-slate-100' },
    { label: 'Accuracy', value: accuracyLabel, tone: 'text-emerald-300' },
    { label: 'Avg Time', value: responseTimeLabel, tone: 'text-amber-300' },
  ];

  return (
    <aside className="space-y-6 lg:sticky lg:top-6 self-start">
      <section className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/90 to-emerald-400/90 text-lg font-semibold text-slate-950">
                DL
              </div>
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950"></span>
            </div>
            <div>
              <p className="text-lg font-semibold">Demo Listener</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Guest profile</p>
            </div>
          </div>
          <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-400">
            Mock
          </span>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Authentication is coming soon. This panel will handle account controls and synced progress.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Aggregated stats</h3>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Local</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${stat.tone}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-slate-400">Last session</span>
          <span className="text-slate-200">{lastSessionLabel}</span>
        </div>
      </section>
    </aside>
  );
}
