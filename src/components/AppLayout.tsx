'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

function PortfolioBanner() {
  return (
    <div className="w-full bg-slate-800 text-slate-200 text-xs py-2 px-4 flex items-center justify-center gap-1 flex-wrap text-center leading-relaxed z-30 flex-shrink-0">
      <span>This is a portfolio project by <strong className="text-white">Lavish Pandey</strong> — AI Business Analyst student. COIS demonstrates customer onboarding operations design, KPI architecture, and AI-assisted risk detection.</span>
      <span className="text-slate-400 mx-1">|</span>
      <span>Built with Rocket.new</span>
      <span className="text-slate-400 mx-1">|</span>
      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline underline-offset-2 transition-colors">View LinkedIn</a>
      <span className="text-slate-400 mx-1">|</span>
      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline underline-offset-2 transition-colors">View GitHub</a>
    </div>
  );
}

function AppFooter() {
  return (
    <footer className="border-t border-border bg-card px-6 py-3 flex-shrink-0">
      <p className="text-xs text-muted-foreground text-center">
        COIS — Customer Onboarding Intelligence System&nbsp;&nbsp;|&nbsp;&nbsp;Portfolio Project by Lavish Pandey&nbsp;&nbsp;|&nbsp;&nbsp;Built with Rocket.new&nbsp;&nbsp;|&nbsp;&nbsp;2026
      </p>
    </footer>
  );
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <PortfolioBanner />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar title={title} subtitle={subtitle} />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-screen-2xl mx-auto px-6 py-6 xl:px-8 2xl:px-10">
              {children}
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}