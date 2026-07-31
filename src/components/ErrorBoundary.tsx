'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-destructive" />
          </div>
          <h2 className="text-lg font-700 text-foreground mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-600 hover:bg-muted/80 transition-colors"
            >
              <Home size={14} />
              Dashboard
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function InlineError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
        <AlertTriangle size={20} className="text-destructive" />
      </div>
      <p className="text-sm font-600 text-foreground mb-1">Failed to load data</p>
      <p className="text-xs text-muted-foreground mb-4">
        {message || 'Unable to connect to the database. Check your Supabase credentials.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-600 hover:bg-primary/20 transition-colors"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
    </div>
  );
}
