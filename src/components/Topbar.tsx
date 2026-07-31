'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, RefreshCw, ChevronDown, LogOut } from 'lucide-react';
import RequestDemoModal from './RequestDemoModal';
import { useAuth } from '@/contexts/AuthContext';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMobileMenuOpen?: () => void;
}

export default function Topbar({ title, subtitle, onMobileMenuOpen }: TopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { profile, signOut, roleLabel, initials } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <>
      <header className="h-14 sm:h-16 bg-card border-b border-border flex items-center px-3 sm:px-6 gap-2 sm:gap-4 sticky top-0 z-20 flex-shrink-0">
        {/* Mobile menu button */}
        {onMobileMenuOpen && (
          <button
            onClick={onMobileMenuOpen}
            className="sm:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            aria-label="Open navigation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground leading-tight hidden sm:block">{subtitle}</p>}
        </div>

        {/* Search — hidden on mobile */}
        <div
          className={`hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 transition-all duration-150 ${searchFocused ? 'ring-2 ring-primary/30 bg-card' : ''}`}
          style={{ minWidth: '200px' }}
        >
          <Search size={14} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search customers, tasks…"
            className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none w-full"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="text-xs text-muted-foreground bg-border px-1.5 py-0.5 rounded font-mono hidden lg:block">⌘K</kbd>
        </div>

        {/* Refresh */}
        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 hidden sm:flex">
          <RefreshCw size={16} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Request Demo button */}
        <button
          onClick={() => setDemoOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all duration-150 flex-shrink-0"
        >
          Request Demo
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-all duration-150"
          >
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground leading-tight">{profile?.fullName || 'User'}</p>
              <p className="text-xs text-muted-foreground leading-tight">{roleLabel}</p>
            </div>
            <ChevronDown size={12} className="text-muted-foreground hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-foreground truncate">{profile?.email}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <RequestDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}