'use client';

import React, { useState } from 'react';
import { X, GitBranch, Server, Shield } from 'lucide-react';
import Link from 'next/link';

export default function LiveDemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 text-white text-xs font-semibold flex-shrink-0">
      {/* Animated pulse dot */}
      <span className="relative flex-shrink-0">
        <span className="absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>

      <span className="font-black tracking-widest uppercase text-white text-xs">Live Demo</span>
      <span className="text-white/50 hidden sm:inline">·</span>
      <span className="text-white/80 hidden sm:inline font-medium">COIS B2B SaaS Platform — DevOps Portfolio Showcase</span>

      {/* Quick links */}
      <div className="hidden md:flex items-center gap-1.5 ml-2">
        <Link
          href="/deployment-pipeline"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 transition-colors text-white text-xs font-semibold border border-white/20"
        >
          <GitBranch size={10} /> Pipeline
        </Link>
        <Link
          href="/infrastructure-status"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 transition-colors text-white text-xs font-semibold border border-white/20"
        >
          <Server size={10} /> Infra
        </Link>
        <Link
          href="/audit-log"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 transition-colors text-white text-xs font-semibold border border-white/20"
        >
          <Shield size={10} /> Audit
        </Link>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/20 transition-colors text-white/70 hover:text-white"
        aria-label="Dismiss demo banner"
      >
        <X size={13} />
      </button>
    </div>
  );
}
