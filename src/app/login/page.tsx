'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from '@/components/ui/AppLogo';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@cois.app', password: 'Admin@2026', role: 'Full system access' },
  { label: 'CEO', email: 'ceo@cois.app', password: 'Ceo@2026', role: 'Executive dashboard + all reports' },
  { label: 'Ops Director', email: 'ops@cois.app', password: 'Ops@2026', role: 'Operations + analytics' },
  { label: 'CS Manager', email: 'csmanager@cois.app', password: 'Csm@2026', role: 'Customer success + reports' },
  { label: 'CS Specialist', email: 'specialist@cois.app', password: 'Css@2026', role: 'Customers + tasks + AI' },
  { label: 'Support Agent', email: 'agent@cois.app', password: 'Agent@2026', role: 'Customers + tasks only' },
];

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setIsLoading(true);
    try {
      await signIn(demoEmail, demoPassword);
      router.replace('/');
    } catch (err: any) {
      setError(err?.message || 'Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <AppLogo size={36} />
          <div>
            <span className="font-bold text-lg text-foreground tracking-tight block leading-tight">COIS</span>
            <span className="text-xs text-muted-foreground">NovaFlow Technologies</span>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-800 text-foreground leading-tight">
              Customer Onboarding<br />Intelligence System
            </h1>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              AI-powered onboarding operations platform with real-time risk detection,
              milestone tracking, and executive analytics.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '50', sub: 'Active Customers' },
              { label: '94%', sub: 'On-Time Rate' },
              { label: '43d', sub: 'Avg TTV' },
              { label: '5', sub: 'Risk Alerts' },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted rounded-xl p-4">
                <p className="text-2xl font-800 text-foreground tabular-nums">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Portfolio project by Lavish Pandey · AI Business & Operations Analyst · 2026
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-2">
            <AppLogo size={28} />
            <span className="font-bold text-base text-foreground">COIS</span>
          </div>

          <div>
            <h2 className="text-2xl font-800 text-foreground">Sign in to COIS</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter your credentials to access the platform</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-600 text-foreground mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@cois.app"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-600 text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-card text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-600 hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn size={15} />
              )}
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo accounts */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs text-muted-foreground">Demo accounts</span>
              <div className="flex-1 border-t border-border" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleDemoLogin(acc.email, acc.password)}
                  disabled={isLoading}
                  className="text-left px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted transition-all disabled:opacity-50 group"
                >
                  <p className="text-xs font-600 text-foreground group-hover:text-primary transition-colors">{acc.label}</p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">{acc.role}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            COIS — Customer Onboarding Intelligence System · Portfolio Project
          </p>
        </div>
      </div>
    </div>
  );
}
