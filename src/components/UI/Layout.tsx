import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4">
        <header className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">🎵 Melow</h1>
          <p className="text-gray-600 text-base">Master Music Intervals</p>
        </header>
        
        <main className="max-w-4xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
