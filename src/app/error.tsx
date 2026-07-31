'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body className="bg-background text-foreground flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={28} className="text-destructive" />
          </div>
          <h1 className="text-2xl font-700 text-foreground mb-2">Application Error</h1>
          <p className="text-sm text-muted-foreground mb-2">
            {error?.message || 'An unexpected error occurred.'}
          </p>
          {error?.digest && (
            <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground rounded-lg text-sm font-600 hover:bg-muted/80 transition-colors"
            >
              <Home size={14} />
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
