'use client';

import { useEffect } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Page Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
        <AlertOctagon className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
        Application Error
      </h1>
      <p className="mt-3 mb-8 max-w-md text-muted-foreground">
        We encountered an unexpected error on this page. Our team has been notified.
        {error.message && (
          <code className="block mt-4 p-3 bg-muted rounded-xl text-xs font-mono text-left overflow-auto border border-border select-all">
            {error.message}
          </code>
        )}
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition active:scale-95 cursor-pointer shadow-sm"
        >
          <RotateCcw size={16} />
          Reload Page
        </button>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-input bg-card font-semibold hover:bg-accent hover:text-accent-foreground transition active:scale-95 cursor-pointer shadow-sm"
        >
          <Home size={16} />
          Back Dashboard
        </a>
      </div>
    </div>
  );
}
