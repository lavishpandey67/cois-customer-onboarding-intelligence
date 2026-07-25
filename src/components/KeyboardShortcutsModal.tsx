'use client';

import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['G', 'D'], description: 'Go to Dashboard', path: '/' },
  { keys: ['G', 'C'], description: 'Go to Customer Management', path: '/customer-management' },
  { keys: ['G', 'T'], description: 'Go to Task Management', path: '/task-management' },
  { keys: ['G', 'A'], description: 'Go to Analytics', path: '/analytics' },
  { keys: ['G', 'R'], description: 'Go to Reports', path: '/reports' },
  { keys: ['Esc'], description: 'Close any open modal', path: null },
];

export function useKeyboardShortcuts(onOpenModal: () => void, onCloseModal: () => void, isModalOpen: boolean) {
  const router = useRouter();

  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Escape') {
        if (isModalOpen) onCloseModal();
        return;
      }

      if (e.key === '?') {
        onOpenModal();
        return;
      }

      const now = Date.now();
      const key = e.key.toUpperCase();

      if (lastKey === 'G' && now - lastKeyTime < 1500) {
        switch (key) {
          case 'D': router.push('/'); break;
          case 'C': router.push('/customer-management'); break;
          case 'T': router.push('/task-management'); break;
          case 'A': router.push('/analytics'); break;
          case 'R': router.push('/reports'); break;
        }
        lastKey = '';
        return;
      }

      lastKey = key;
      lastKeyTime = now;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, onOpenModal, onCloseModal, isModalOpen]);
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm z-10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-primary" />
            <h2 className="text-base font-700 text-foreground">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, ki) => (
                  <React.Fragment key={ki}>
                    <kbd className="text-xs bg-muted border border-border rounded px-2 py-1 font-mono text-foreground">
                      {k}
                    </kbd>
                    {ki < s.keys.length - 1 && (
                      <span className="text-xs text-muted-foreground">then</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            Press <kbd className="text-xs bg-muted border border-border rounded px-1.5 py-0.5 font-mono">?</kbd> anywhere to open this panel
          </p>
        </div>
      </div>
    </div>
  );
}
