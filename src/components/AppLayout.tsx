'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import KeyboardShortcutsModal, { useKeyboardShortcuts } from './KeyboardShortcutsModal';
import { Keyboard } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
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

function KeyboardFAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Keyboard shortcuts (?)"
      className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
    >
      <Keyboard size={16} />
    </button>
  );
}

function AppLayoutInner({ children, title, subtitle }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useKeyboardShortcuts(
    () => setShortcutsOpen(true),
    () => setShortcutsOpen(false),
    shortcutsOpen
  );

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
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
      <KeyboardFAB onClick={() => setShortcutsOpen(true)} />
      <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return <AppLayoutInner title={title} subtitle={subtitle}>{children}</AppLayoutInner>;
}