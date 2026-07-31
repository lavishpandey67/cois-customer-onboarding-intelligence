'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Zap, GitBranch, Rocket, Server, X, XCircle, RefreshCw, Activity, Database } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface SimulatedEvent {
  id: string;
  type: 'pipeline_run' | 'deploy' | 'infra_alert' | 'build_failed' | 'rollback';
  title: string;
  detail: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  environment: string;
}

const PIPELINE_COMMITS = [
  { hash: 'f2a1c89', msg: 'feat: add customer health score caching' },
  { hash: 'e8b3d12', msg: 'fix: resolve SLA breach notification race condition' },
  { hash: 'c4f7a33', msg: 'refactor: optimise Supabase query batching' },
  { hash: 'a9d2e56', msg: 'feat: add P1 incident auto-escalation' },
  { hash: 'b1c8f74', msg: 'chore: update dependencies — security patches' },
  { hash: 'd5e9b21', msg: 'feat: export audit log to CSV' },
  { hash: '7f3a1c0', msg: 'fix: correct Redis cache TTL for session tokens' },
  { hash: '2b8d4e9', msg: 'feat: add cloud cost budget alerts' },
  { hash: '9e3f1a7', msg: 'perf: lazy-load dashboard chart components' },
  { hash: '4c7b2d8', msg: 'fix: mobile sidebar overflow on small screens' },
];

const ENGINEERS = ['Lavish Pandey', 'Sarah Chen', 'Rahul Mehta', 'Priya Nair', 'Alex Kim'];
const ENVIRONMENTS = ['Production', 'Staging', 'Dev'];
const PROVIDERS = ['AWS us-east-1', 'Azure westeurope', 'AWS ap-south-1'];
const INFRA_SERVICES = ['Redis Cache', 'API Gateway', 'Load Balancer', 'Supabase DB', 'CDN Edge', 'Container Registry', 'Auth Service', 'Next.js App'];
const INFRA_CHANGES = [
  'Memory limit increased from 512MB to 1GB',
  'Auto-scaling threshold adjusted to 70% CPU',
  'SSL certificate renewed — 365 days',
  'Database connection pool expanded to 200',
  'CDN cache TTL updated to 3600s',
  'Health check interval reduced to 10s',
  'Replica count scaled from 2 to 4',
  'Rate limiting threshold updated to 1000 req/min',
];

let runCounter = 248;

function generateEvent(): SimulatedEvent {
  const rand = Math.random();
  const id = `sim-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
  const now = new Date().toISOString();
  const commit = PIPELINE_COMMITS[Math.floor(Math.random() * PIPELINE_COMMITS.length)];
  const engineer = ENGINEERS[Math.floor(Math.random() * ENGINEERS.length)];
  const env = ENVIRONMENTS[Math.floor(Math.random() * ENVIRONMENTS.length)];
  const provider = PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)];

  if (rand < 0.30) {
    const runNum = runCounter++;
    const success = Math.random() > 0.2;
    const duration = `${Math.floor(3 + Math.random() * 8)}m ${Math.floor(Math.random() * 59)}s`;
    return {
      id, type: 'pipeline_run',
      title: `Pipeline #${runNum} — ${success ? '✓ Passed' : '✗ Failed'}`,
      detail: `${commit.msg} · ${commit.hash} · ${env} · ${duration}`,
      timestamp: now,
      severity: success ? 'success' : 'error',
      environment: env,
    };
  } else if (rand < 0.55) {
    const runNum = runCounter++;
    return {
      id, type: 'deploy',
      title: `Deploy #${runNum} → ${env}`,
      detail: `${commit.msg} · ${commit.hash} · by ${engineer} · ${provider}`,
      timestamp: now,
      severity: env === 'Production' ? 'success' : 'info',
      environment: env,
    };
  } else if (rand < 0.75) {
    const service = INFRA_SERVICES[Math.floor(Math.random() * INFRA_SERVICES.length)];
    const change = INFRA_CHANGES[Math.floor(Math.random() * INFRA_CHANGES.length)];
    return {
      id, type: 'infra_alert',
      title: `Infra Change — ${service}`,
      detail: `${change} · ${env} · ${provider}`,
      timestamp: now,
      severity: Math.random() > 0.5 ? 'warning' : 'info',
      environment: env,
    };
  } else if (rand < 0.90) {
    const stages = ['Unit Tests', 'Lint & Type Check', 'Security Scan', 'Docker Build', 'Smoke Tests'];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    return {
      id, type: 'build_failed',
      title: `Build Failed — ${stage}`,
      detail: `${commit.msg} · ${commit.hash} · ${env} · Pipeline halted`,
      timestamp: now,
      severity: 'error',
      environment: env,
    };
  } else {
    const runNum = runCounter - 1;
    return {
      id, type: 'rollback',
      title: `Rollback Triggered — ${env}`,
      detail: `Rolled back Run #${runNum} · Health check failures · ${provider}`,
      timestamp: now,
      severity: 'warning',
      environment: env,
    };
  }
}

// Global event store so multiple components can share the same stream
const listeners: Set<(event: SimulatedEvent) => void> = new Set();
let simulatorInterval: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

function startSimulator(intervalMs: number) {
  if (simulatorInterval) return;
  isRunning = true;
  simulatorInterval = setInterval(() => {
    if (listeners.size > 0) {
      const event = generateEvent();
      listeners.forEach(fn => fn(event));
    }
  }, intervalMs);
}

function stopSimulator() {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
  isRunning = false;
}

// Persist event to Supabase
async function persistEvent(event: SimulatedEvent): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('simulator_events').insert({
      event_type: event.type,
      title: event.title,
      detail: event.detail,
      severity: event.severity,
      environment: event.environment,
    });
  } catch {
    // Silently fail — simulator should not break if DB is unavailable
  }
}

// Cleanup old events (keep last 100)
async function cleanupOldEvents(): Promise<void> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('simulator_events')
      .select('id')
      .order('created_at', { ascending: false })
      .range(100, 9999);
    if (data && data.length > 0) {
      const ids = data.map((r: any) => r.id);
      await supabase.from('simulator_events').delete().in('id', ids);
    }
  } catch {
    // Silently fail
  }
}

export function useDemoSimulator(intervalMs = 4000) {
  const [events, setEvents] = useState<SimulatedEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const cleanupRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load persisted events on mount
  useEffect(() => {
    async function loadPersistedEvents() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('simulator_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && data && data.length > 0) {
          const loaded: SimulatedEvent[] = data.map((row: any) => ({
            id: row.id,
            type: row.event_type as SimulatedEvent['type'],
            title: row.title,
            detail: row.detail,
            timestamp: row.created_at,
            severity: row.severity as SimulatedEvent['severity'],
            environment: row.environment,
          }));
          setEvents(loaded);
          setDbConnected(true);
        }
      } catch {
        setDbConnected(false);
      }
    }
    loadPersistedEvents();
  }, []);

  // Subscribe to real-time inserts
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('simulator_events_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'simulator_events' }, (payload) => {
        const row = payload.new as any;
        const newEvent: SimulatedEvent = {
          id: row.id,
          type: row.event_type as SimulatedEvent['type'],
          title: row.title,
          detail: row.detail,
          timestamp: row.created_at,
          severity: row.severity as SimulatedEvent['severity'],
          environment: row.environment,
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 50));
        setDbConnected(true);
      })
      .subscribe((status) => {
        setDbConnected(status === 'SUBSCRIBED');
      });
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleEvent = useCallback((event: SimulatedEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50));
    persistEvent(event);
  }, []);

  const start = useCallback(() => {
    listeners.add(handleEvent);
    startSimulator(intervalMs);
    setRunning(true);
    // Cleanup old events every 5 minutes
    cleanupRef.current = setInterval(cleanupOldEvents, 5 * 60 * 1000);
  }, [handleEvent, intervalMs]);

  const stop = useCallback(() => {
    listeners.delete(handleEvent);
    if (listeners.size === 0) stopSimulator();
    setRunning(false);
    if (cleanupRef.current) {
      clearInterval(cleanupRef.current);
      cleanupRef.current = null;
    }
  }, [handleEvent]);

  const clear = useCallback(async () => {
    setEvents([]);
    try {
      const supabase = createClient();
      await supabase.from('simulator_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    return () => {
      listeners.delete(handleEvent);
      if (listeners.size === 0) stopSimulator();
      if (cleanupRef.current) clearInterval(cleanupRef.current);
    };
  }, [handleEvent]);

  return { events, running, start, stop, clear, dbConnected };
}

function getEventIcon(type: SimulatedEvent['type']): React.ReactNode {
  switch (type) {
    case 'pipeline_run': return <GitBranch size={13} />;
    case 'deploy':       return <Rocket size={13} />;
    case 'infra_alert':  return <Server size={13} />;
    case 'build_failed': return <XCircle size={13} />;
    case 'rollback':     return <RefreshCw size={13} />;
    default:             return <Zap size={13} />;
  }
}

const SEVERITY_CONFIG = {
  info:    { color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    dot: 'bg-blue-500',    label: 'INFO' },
  success: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'OK' },
  warning: { color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500',   label: 'WARN' },
  error:   { color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     dot: 'bg-red-500',     label: 'ERR' },
};

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ago`;
}

interface DemoSimulatorPanelProps {
  events: SimulatedEvent[];
  running: boolean;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  dbConnected?: boolean;
  maxVisible?: number;
}

export function DemoSimulatorPanel({ events, running, onStart, onStop, onClear, dbConnected = false, maxVisible = 20 }: DemoSimulatorPanelProps) {
  const visible = events.slice(0, maxVisible);
  const errorCount = events.filter(e => e.severity === 'error').length;
  const warnCount = events.filter(e => e.severity === 'warning').length;

  return (
    <div className={`bg-card border-2 rounded-xl overflow-hidden transition-all ${running ? 'border-amber-300' : 'border-border'}`}>
      {/* Panel Header */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-muted/30">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <Zap size={14} className={running ? 'text-amber-500' : 'text-muted-foreground'} />
            <span className="text-sm font-bold text-foreground">Demo Event Simulator</span>
          </div>
          {running && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              LIVE
            </span>
          )}
          {/* DB connection indicator */}
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border ${
            dbConnected
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :'text-muted-foreground bg-muted border-border'
          }`}>
            <Database size={10} />
            {dbConnected ? 'Supabase' : 'Local'}
          </span>
          {events.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-mono">{events.length} events</span>
              {errorCount > 0 && <span className="font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">{errorCount} errors</span>}
              {warnCount > 0 && <span className="font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">{warnCount} warnings</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg bg-background hover:bg-muted transition-all"
            >
              <X size={11} /> Clear
            </button>
          )}
          <button
            onClick={running ? onStop : onStart}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              running
                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' :'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {running ? <><Pause size={11} /> Stop</> : <><Play size={11} /> Start Simulator</>}
          </button>
        </div>
      </div>

      {/* Event Feed */}
      <div className="divide-y divide-border max-h-72 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Activity size={20} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-medium">No events yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">Start the simulator to generate live pipeline events</p>
          </div>
        ) : (
          visible.map(event => {
            const cfg = SEVERITY_CONFIG[event.severity];
            return (
              <div key={event.id} className={`flex items-start gap-3 px-4 sm:px-5 py-3 hover:bg-muted/20 transition-colors ${cfg.bg}/30`}>
                <div className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground truncate">{event.title}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{cfg.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 font-medium ${
                      event.environment === 'Production' ? 'bg-violet-100 text-violet-700' :
                      event.environment === 'Staging'? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>{event.environment}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground font-mono flex-shrink-0 mt-0.5">{formatRelative(event.timestamp)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
