'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import {
  Shield, Search, Filter, RefreshCw, LogIn, LogOut, Eye, Plus, Edit2,
  Trash2, FileText, AlertTriangle, UserPlus, Key, ChevronDown,
  Rocket, RotateCcw, GitBranch, Server, Zap,
} from 'lucide-react';
import { useDemoSimulator, DemoSimulatorPanel, SimulatedEvent } from '@/components/DemoEventSimulator';

interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, any>;
  ipAddress: string;
  createdAt: string;
  isDevOps?: boolean;
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  login:          { icon: <LogIn size={12} />,       color: 'text-green-700',  bg: 'bg-green-100',  label: 'Login' },
  logout:         { icon: <LogOut size={12} />,      color: 'text-slate-600',  bg: 'bg-slate-100',  label: 'Logout' },
  view:           { icon: <Eye size={12} />,         color: 'text-blue-700',   bg: 'bg-blue-100',   label: 'View' },
  create:         { icon: <Plus size={12} />,        color: 'text-emerald-700',bg: 'bg-emerald-100',label: 'Create' },
  update:         { icon: <Edit2 size={12} />,       color: 'text-amber-700',  bg: 'bg-amber-100',  label: 'Update' },
  delete:         { icon: <Trash2 size={12} />,      color: 'text-red-700',    bg: 'bg-red-100',    label: 'Delete' },
  export:         { icon: <FileText size={12} />,    color: 'text-purple-700', bg: 'bg-purple-100', label: 'Export' },
  escalate:       { icon: <AlertTriangle size={12} />,color: 'text-orange-700',bg: 'bg-orange-100', label: 'Escalate' },
  invite:         { icon: <UserPlus size={12} />,    color: 'text-indigo-700', bg: 'bg-indigo-100', label: 'Invite' },
  role_change:    { icon: <Shield size={12} />,      color: 'text-violet-700', bg: 'bg-violet-100', label: 'Role Change' },
  password_reset: { icon: <Key size={12} />,         color: 'text-rose-700',   bg: 'bg-rose-100',   label: 'Password Reset' },
  deploy:         { icon: <Rocket size={12} />,      color: 'text-violet-700', bg: 'bg-violet-100', label: 'Deploy' },
  rollback:       { icon: <RotateCcw size={12} />,   color: 'text-red-700',    bg: 'bg-red-100',    label: 'Rollback' },
  pipeline_run:   { icon: <GitBranch size={12} />,   color: 'text-blue-700',   bg: 'bg-blue-100',   label: 'Pipeline Run' },
  infra_change:   { icon: <Server size={12} />,      color: 'text-amber-700',  bg: 'bg-amber-100',  label: 'Infra Change' },
  build_failed:   { icon: <Zap size={12} />,         color: 'text-red-700',    bg: 'bg-red-100',    label: 'Build Failed' },
  infra_alert:    { icon: <Server size={12} />,      color: 'text-amber-700',  bg: 'bg-amber-100',  label: 'Infra Alert' },
};

const DEVOPS_ACTIONS = ['deploy', 'rollback', 'pipeline_run', 'infra_change', 'build_failed', 'infra_alert'];

const SIMULATED_DEVOPS_EVENTS: AuditLog[] = [
  {
    id: 'devops-001', userId: null, userEmail: 'ci-cd@pipeline.internal', userRole: 'system',
    action: 'deploy', resource: 'production', resourceId: 'pl-247',
    details: { run: '#247', commit: 'a3f9c12', branch: 'main', environment: 'Production', provider: 'AWS us-east-1', duration: '4m 12s', status: 'in_progress' },
    ipAddress: '10.0.1.50', createdAt: new Date(Date.now() - 4 * 60000).toISOString(), isDevOps: true,
  },
  {
    id: 'devops-002', userId: null, userEmail: 'ci-cd@pipeline.internal', userRole: 'system',
    action: 'pipeline_run', resource: 'staging', resourceId: 'pl-246',
    details: { run: '#246', commit: 'b7e2d45', branch: 'feature/ai-chat-history', environment: 'Staging', provider: 'Azure westeurope', result: 'success', duration: '7m 38s' },
    ipAddress: '10.0.1.50', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), isDevOps: true,
  },
  {
    id: 'devops-003', userId: null, userEmail: 'ci-cd@pipeline.internal', userRole: 'system',
    action: 'build_failed', resource: 'staging', resourceId: 'pl-245',
    details: { run: '#245', commit: 'c1a8f33', branch: 'fix/sla-seed-ids', stage: 'Unit Tests', error: '3 tests failed — SLA customer_id mismatch', duration: '3m 11s' },
    ipAddress: '10.0.1.50', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), isDevOps: true,
  },
  {
    id: 'devops-004', userId: null, userEmail: 'ci-cd@pipeline.internal', userRole: 'system',
    action: 'deploy', resource: 'production', resourceId: 'pl-244',
    details: { run: '#244', commit: 'd4b1e90', branch: 'main', environment: 'Production', provider: 'AWS us-east-1', duration: '8m 02s', status: 'success', version: 'v2.4.7' },
    ipAddress: '10.0.1.50', createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), isDevOps: true,
  },
  {
    id: 'devops-005', userId: null, userEmail: 'infra-bot@cois.internal', userRole: 'system',
    action: 'infra_change', resource: 'staging', resourceId: 'redis-staging',
    details: { service: 'Redis Cache', environment: 'Staging', change: 'Memory limit increased from 512MB to 1GB', provider: 'Azure westeurope', reason: 'Cache latency spike INC-041' },
    ipAddress: '10.0.2.11', createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString(), isDevOps: true,
  },
  {
    id: 'devops-006', userId: null, userEmail: 'ci-cd@pipeline.internal', userRole: 'system',
    action: 'rollback', resource: 'staging', resourceId: 'pl-243',
    details: { run: '#243', environment: 'Staging', rolledBackTo: 'v2.4.6', reason: 'Health check failures after deploy', duration: '1m 22s' },
    ipAddress: '10.0.1.50', createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), isDevOps: true,
  },
];

function simEventToAuditLog(e: SimulatedEvent): AuditLog {
  return {
    id: e.id,
    userId: null,
    userEmail: e.type === 'infra_alert' ? 'infra-bot@cois.internal' : 'ci-cd@pipeline.internal',
    userRole: 'system',
    action: e.type === 'infra_alert' ? 'infra_change' : e.type,
    resource: e.environment.toLowerCase(),
    resourceId: null,
    details: { title: e.title, detail: e.detail, environment: e.environment, simulated: true },
    ipAddress: '10.0.1.50',
    createdAt: e.timestamp,
    isDevOps: true,
  };
}

function rowToLog(row: any): AuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    userRole: row.user_role,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id,
    details: row.details || {},
    ipAddress: row.ip_address,
    createdAt: row.created_at,
    isDevOps: false,
  };
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'devops' | 'app'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState('');

  const { events: simEvents, running: simRunning, start: startSim, stop: stopSim, clear: clearSim } = useDemoSimulator(3500);

  const supabase = createClient();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      const dbLogs = (!error && data) ? data.map(rowToLog) : [];
      const merged = [...dbLogs, ...SIMULATED_DEVOPS_EVENTS].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLogs(merged);
    } catch (e) {
      console.error('fetchLogs error:', e);
      setLogs(SIMULATED_DEVOPS_EVENTS);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const channel = supabase
      .channel('audit_logs_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => {
        fetchLogs();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLogs]);

  // Merge simulator events into the log list
  const simAuditLogs: AuditLog[] = simEvents.map(simEventToAuditLog);
  const allLogs = [...simAuditLogs, ...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const tabFiltered = allLogs.filter(l => {
    if (activeTab === 'devops') return l.isDevOps || DEVOPS_ACTIONS.includes(l.action);
    if (activeTab === 'app') return !l.isDevOps && !DEVOPS_ACTIONS.includes(l.action);
    return true;
  });

  const filtered = tabFiltered.filter(l => {
    const matchSearch = !search ||
      l.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    const matchResource = resourceFilter === 'all' || l.resource === resourceFilter;
    return matchSearch && matchAction && matchResource;
  });

  const uniqueActions = Array.from(new Set(tabFiltered.map(l => l.action)));
  const uniqueResources = Array.from(new Set(tabFiltered.map(l => l.resource)));

  const devopsCount = allLogs.filter(l => l.isDevOps || DEVOPS_ACTIONS.includes(l.action)).length;
  const appCount = allLogs.filter(l => !l.isDevOps && !DEVOPS_ACTIONS.includes(l.action)).length;

  const stats = {
    total: allLogs.length,
    today: allLogs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length,
    logins: allLogs.filter(l => l.action === 'login').length,
    deploys: allLogs.filter(l => l.action === 'deploy').length,
  };

  return (
    <AppLayout title="Audit Log" subtitle="Complete activity trail — application events + DevOps pipeline activity">
      <div className="space-y-5">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: stats.total, color: 'text-foreground', bg: 'bg-muted' },
            { label: 'Today', value: stats.today, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Logins', value: stats.logins, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Deploys', value: stats.deploys, color: 'text-violet-700', bg: 'bg-violet-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-border`}>
              <p className={`text-2xl font-800 tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Demo Simulator Panel */}
        <DemoSimulatorPanel
          events={simEvents}
          running={simRunning}
          onStart={startSim}
          onStop={stopSim}
          onClear={clearSim}
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
          {[
            { key: 'all',    label: `All (${allLogs.length})` },
            { key: 'app',    label: `Application (${appCount})` },
            { key: 'devops', label: `DevOps (${devopsCount})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-600 transition-all ${
                activeTab === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user, resource, action…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="relative">
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="pl-7 pr-7 py-2 text-xs rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(a => <option key={a} value={a}>{ACTION_CONFIG[a]?.label || a}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={resourceFilter}
              onChange={e => setResourceFilter(e.target.value)}
              className="pl-3 pr-7 py-2 text-xs rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
            >
              <option value="all">All Resources</option>
              {uniqueResources.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-600 text-muted-foreground hover:text-foreground border border-border rounded-lg bg-background hover:bg-muted transition-all"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {lastRefreshed && (
            <span className="text-xs text-muted-foreground hidden sm:block">Updated {lastRefreshed}</span>
          )}
        </div>

        {/* Log Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-primary" />
              <span className="text-sm font-bold text-foreground">Activity Trail</span>
              <span className="text-xs text-muted-foreground">({filtered.length} events)</span>
              {activeTab === 'devops' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 border border-violet-200">DevOps Feed</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${simRunning ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="text-xs text-muted-foreground font-medium">{simRunning ? 'Simulating' : 'Live'}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Shield size={32} className="mb-3 opacity-30" />
              <p className="text-sm font-semibold">No audit events found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Timestamp', 'User / System', 'Action', 'Resource', 'IP Address', 'Details'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log, i) => {
                    const cfg = ACTION_CONFIG[log.action] || { icon: <Eye size={12} />, color: 'text-slate-600', bg: 'bg-slate-100', label: log.action };
                    const isExpanded = expandedId === log.id;
                    const isDevOpsRow = log.isDevOps || DEVOPS_ACTIONS.includes(log.action);
                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          className={`border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${
                            isDevOpsRow ? 'bg-violet-50/40' : i % 2 === 0 ? '' : 'bg-muted/10'
                          }`}
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-xs font-bold text-foreground tabular-nums">{formatRelative(log.createdAt)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(log.createdAt)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-foreground">{log.userEmail}</p>
                            <p className="text-xs text-muted-foreground capitalize">{log.userRole.replace(/_/g, ' ')}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>
                              {cfg.icon}{cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold text-foreground capitalize">{log.resource.replace(/_/g, ' ')}</span>
                            {log.resourceId && <p className="text-xs text-muted-foreground font-mono">{log.resourceId}</p>}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{log.ipAddress || '—'}</td>
                          <td className="px-4 py-3">
                            <ChevronDown size={13} className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="border-b border-border bg-muted/20">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                                <p className="text-xs font-bold text-slate-400 mb-2 font-mono">// Event Details</p>
                                <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
