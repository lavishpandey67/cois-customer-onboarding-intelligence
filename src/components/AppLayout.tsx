'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import KeyboardShortcutsModal, { useKeyboardShortcuts } from './KeyboardShortcutsModal';
import LiveDemoBanner from './LiveDemoBanner';
import { Keyboard, X, Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

function AppFooter() {
  return (
    <footer className="border-t border-border bg-card px-4 sm:px-6 py-3 flex-shrink-0">
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

function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 z-40 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-all duration-150 sm:hidden"
      aria-label="Open navigation"
    >
      <Menu size={18} />
    </button>
  );
}

function AppLayoutInner({ children, title, subtitle }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useKeyboardShortcuts(
    () => setShortcutsOpen(true),
    () => setShortcutsOpen(false),
    shortcutsOpen
  );

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [title]);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <LiveDemoBanner />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden sm:block flex-shrink-0">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 sm:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-card shadow-2xl z-10">
              <div className="absolute top-3 right-3 z-20">
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
              <Sidebar collapsed={false} onToggle={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar title={title} subtitle={subtitle} onMobileMenuOpen={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 xl:px-8 2xl:px-10">
              {children}
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
      <KeyboardFAB onClick={() => setShortcutsOpen(true)} />
      <MobileMenuButton onClick={() => setMobileNavOpen(true)} />
      <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return <AppLayoutInner title={title} subtitle={subtitle}>{children}</AppLayoutInner>;
}