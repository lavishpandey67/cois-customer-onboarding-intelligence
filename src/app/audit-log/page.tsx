'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import { Shield, Search, Filter, RefreshCw, LogIn, LogOut, Eye, Plus, Edit2, Trash2, FileText, AlertTriangle, UserPlus, Key, ChevronDown } from 'lucide-react';

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
};

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState('');

  const supabase = createClient();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (!error && data) {
        setLogs(data.map(rowToLog));
      }
    } catch (e) {
      console.error('fetchLogs error:', e);
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

  const filtered = logs.filter(l => {
    const matchSearch = !search ||
      l.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    const matchResource = resourceFilter === 'all' || l.resource === resourceFilter;
    return matchSearch && matchAction && matchResource;
  });

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));
  const uniqueResources = Array.from(new Set(logs.map(l => l.resource)));

  const stats = {
    total: logs.length,
    today: logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length,
    logins: logs.filter(l => l.action === 'login').length,
    exports: logs.filter(l => l.action === 'export').length,
  };

  return (
    <AppLayout title="Audit Log" subtitle="Complete activity trail — every action, every user, every timestamp">
      <div className="space-y-5">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: stats.total, color: 'text-foreground', bg: 'bg-muted' },
            { label: 'Today', value: stats.today, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Logins', value: stats.logins, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Exports', value: stats.exports, color: 'text-purple-700', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-border`}>
              <p className={`text-2xl font-800 tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
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
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-primary" />
              <span className="text-sm font-700 text-foreground">Activity Trail</span>
              <span className="text-xs text-muted-foreground">({filtered.length} events)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Shield size={32} className="mb-3 opacity-30" />
              <p className="text-sm font-600">No audit events found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Timestamp', 'User', 'Action', 'Resource', 'IP Address', 'Details'].map(h => (
                      <th key={h} className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log, i) => {
                    const cfg = ACTION_CONFIG[log.action] || { icon: <Eye size={12} />, color: 'text-slate-600', bg: 'bg-slate-100', label: log.action };
                    const isExpanded = expandedId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          className={`border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-xs font-600 text-foreground tabular-nums">{formatRelative(log.createdAt)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(log.createdAt)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-600 text-foreground">{log.userEmail}</p>
                            <p className="text-xs text-muted-foreground capitalize">{log.userRole.replace(/_/g, ' ')}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-600 px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>
                              {cfg.icon}{cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-600 text-foreground capitalize">{log.resource.replace(/_/g, ' ')}</span>
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
                              <div className="bg-card border border-border rounded-lg p-3">
                                <p className="text-xs font-700 text-foreground mb-2">Event Details</p>
                                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
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
