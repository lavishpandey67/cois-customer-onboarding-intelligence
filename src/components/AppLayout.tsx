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
    <div className="w-full bg-navy-900 text-white text-xs py-1.5 px-4 flex items-center justify-center gap-1 flex-wrap text-center leading-relaxed z-30 flex-shrink-0" style={{ backgroundColor: '#0a1628' }}>
      <span>Portfolio Project by{' '}
        <a
          href="https://linkedin.com/in/lavish-pandey-2846273a4"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-blue-300 transition-colors font-semibold"
        >
          Lavish Pandey
        </a>
        {' '}— AI Business &amp; Operations Analyst
      </span>
      <span className="opacity-40 mx-1">|</span>
      <span>Built with Rocket.new</span>
      <span className="opacity-40 mx-1">|</span>
      <a
        href="https://github.com/lavishpandey67"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-blue-300 transition-colors underline underline-offset-2"
      >
        GitHub: github.com/lavishpandey67
      </a>
    </div>
  );
}

function AppFooter() {
  return (
    <footer className="border-t border-border bg-card px-6 py-3 flex-shrink-0">
      <p className="text-xs text-muted-foreground text-center">
        COIS — Customer Onboarding Intelligence System&nbsp;&nbsp;|&nbsp;&nbsp;Portfolio Project by Lavish Pandey&nbsp;&nbsp;|&nbsp;&nbsp;2026
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