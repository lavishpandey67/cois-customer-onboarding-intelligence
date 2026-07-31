'use client';

import React, { useState, useEffect } from 'react';
import { Share2, X, Link2, Check } from 'lucide-react';

// Inline SVG icons to avoid lucide-react barrel optimization issues
function LinkedinIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

interface StickyShareWidgetProps {
  pageTitle: string;
  pageUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export default function StickyShareWidget({
  pageTitle,
  pageUrl,
  githubUrl = 'https://github.com/lavishpandey67',
  linkedinUrl = 'https://linkedin.com/in/lavishpandey',
}: StickyShareWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(pageUrl || window.location.href);
  }, [pageUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(pageTitle)}`;
  const githubProfileUrl = githubUrl;

  return (
    <div className="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-2">
      {/* Expanded buttons */}
      {expanded && (
        <div className="flex flex-col gap-2 items-end">
          {/* LinkedIn share */}
          <a
            href={linkedinShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-lg hover:bg-blue-500 transition-all whitespace-nowrap"
            title="Share on LinkedIn"
          >
            <LinkedinIcon size={13} />
            Share on LinkedIn
          </a>

          {/* GitHub profile */}
          <a
            href={githubProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold shadow-lg hover:bg-slate-700 transition-all border border-slate-700 whitespace-nowrap"
            title="View on GitHub"
          >
            <GithubIcon size={13} />
            View on GitHub
          </a>

          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-semibold shadow-lg hover:bg-muted transition-all whitespace-nowrap"
            title="Copy page link"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Link2 size={13} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          expanded
            ? 'bg-muted border border-border text-muted-foreground hover:text-foreground'
            : 'bg-primary text-primary-foreground hover:opacity-90'
        }`}
        aria-label={expanded ? 'Close share menu' : 'Share this page'}
        title={expanded ? 'Close' : 'Share'}
      >
        {expanded ? <X size={16} /> : <Share2 size={16} />}
      </button>
    </div>
  );
}
