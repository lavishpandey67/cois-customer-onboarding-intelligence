'use client';

import React, { useState } from 'react';
import { Search, Bell, RefreshCw, ChevronDown } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-4 sticky top-0 z-20 flex-shrink-0">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-700 text-foreground leading-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground leading-tight">{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div
        className={`flex items-center gap-2 bg-muted rounded-lg px-3 py-2 transition-all duration-150 ${
          searchFocused ? 'ring-2 ring-primary/30 bg-card' : ''
        }`}
        style={{ minWidth: '220px' }}
      >
        <Search size={14} className="text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Search customers, tasks…"
          className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none w-full"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <kbd className="text-xs text-muted-foreground bg-border px-1.5 py-0.5 rounded font-mono hidden sm:block">
          ⌘K
        </kbd>
      </div>

      {/* Refresh */}
      <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150">
        <RefreshCw size={16} />
      </button>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
      </button>

      {/* User menu */}
      <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-all duration-150">
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-700 flex items-center justify-center">
          AK
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-600 text-foreground leading-tight">
            Anika Kapoor
          </p>
          <p className="text-xs text-muted-foreground leading-tight">
            Ops Director
          </p>
        </div>
        <ChevronDown size={12} className="text-muted-foreground hidden sm:block" />
      </button>
    </header>
  );
}