import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  headerActions?: ReactNode;
}

export function Layout({ children, headerActions }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0b0f16] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 right-[-10%] h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_55%)]"></div>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6">
        <header className="mb-10 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-400/90 to-emerald-400/90 shadow-[0_0_30px_rgba(34,211,238,0.35)]"></div>
            <h1 className="text-2xl font-semibold tracking-tight">Melow</h1>
          </div>
          <div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-slate-800 via-slate-700 to-transparent"></div>
          {headerActions ? (
            <div className="flex items-center justify-end gap-2">
              {headerActions}
            </div>
          ) : null}
        </header>

        <main className="flex-1 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
