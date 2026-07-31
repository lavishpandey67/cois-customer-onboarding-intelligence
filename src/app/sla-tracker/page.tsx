'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import { AlertTriangle, CheckCircle, RefreshCw, ChevronDown, Mail, Flame, Clock, User, Activity, Zap } from 'lucide-react';

interface SLAPolicy {
  id: string;
  name: string;
  tier: string;
  responseHours: number;
  resolutionHours: number;
  escalationHours: number;
  isActive: boolean;
}

interface SLABreach {
  id: string;
  customerId: string;
  customerName: string;
  tier: string;
  policyName: string;
  breachType: string;
  slaHours: number;
  actualHours: number;
  breachHours: number;
  status: 'active' | 'breached' | 'at_risk' | 'resolved';
  manager: string;
  openedAt: string;
  resolvedAt: string | null;
}

interface Incident {
  id: string;
  title: string;
  priority: 'P1' | 'P2' | 'P3';
  status: 'open' | 'investigating' | 'mitigated' | 'resolved';
  assignedEngineer: string;
  affectedService: string;
  affectedCustomers: number;
  openedAt: string;
  resolvedAt: string | null;
  mttrMinutes: number | null;
  description: string;
  updates: { time: string; message: string }[];
}

const STATUS_CONFIG = {
  breached: { label: 'Breached',  color: 'text-red-700',    bg: 'bg-red-100',    dot: 'bg-red-500' },
  at_risk:  { label: 'At Risk',   color: 'text-amber-700',  bg: 'bg-amber-100',  dot: 'bg-amber-500' },
  active:   { label: 'Active',    color: 'text-blue-700',   bg: 'bg-blue-100',   dot: 'bg-blue-500' },
  resolved: { label: 'Resolved',  color: 'text-green-700',  bg: 'bg-green-100',  dot: 'bg-green-500' },
};

const INCIDENT_STATUS_CONFIG = {
  open:          { label: 'Open',          color: 'text-red-700',    bg: 'bg-red-100',    dot: 'bg-red-500 animate-pulse' },
  investigating: { label: 'Investigating', color: 'text-amber-700',  bg: 'bg-amber-100',  dot: 'bg-amber-500 animate-pulse' },
  mitigated:     { label: 'Mitigated',     color: 'text-blue-700',   bg: 'bg-blue-100',   dot: 'bg-blue-500' },
  resolved:      { label: 'Resolved',      color: 'text-green-700',  bg: 'bg-green-100',  dot: 'bg-green-500' },
};

const PRIORITY_CONFIG = {
  P1: { label: 'P1 — Critical', color: 'text-red-700',    bg: 'bg-red-100',    border: 'border-red-200',    icon: <Flame size={12} /> },
  P2: { label: 'P2 — High',     color: 'text-amber-700',  bg: 'bg-amber-100',  border: 'border-amber-200',  icon: <AlertTriangle size={12} /> },
  P3: { label: 'P3 — Medium',   color: 'text-blue-700',   bg: 'bg-blue-100',   border: 'border-blue-200',   icon: <Activity size={12} /> },
};

const TIER_COLORS: Record<string, string> = {
  Enterprise: 'bg-violet-100 text-violet-700',
  'Mid-Market': 'bg-blue-100 text-blue-700',
  SMB: 'bg-slate-100 text-slate-700',
};

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-047',
    title: 'Production API Gateway — 502 errors on /customers endpoint',
    priority: 'P1',
    status: 'investigating',
    assignedEngineer: 'Lavish Pandey',
    affectedService: 'API Gateway (AWS us-east-1)',
    affectedCustomers: 8,
    openedAt: new Date(Date.now() - 42 * 60000).toISOString(),
    resolvedAt: null,
    mttrMinutes: null,
    description: 'Elevated 502 error rate (18%) on the /customers REST endpoint. Root cause suspected to be memory pressure on the API gateway pod. Rollback of v2.4.8 in progress.',
    updates: [
      { time: '14 min ago', message: 'Rollback to v2.4.7 initiated on Production cluster' },
      { time: '28 min ago', message: 'Memory limit increased on API gateway pod — monitoring' },
      { time: '42 min ago', message: 'Incident opened — 502 errors detected by uptime monitor' },
    ],
  },
  {
    id: 'INC-046',
    title: 'Supabase real-time subscriptions dropping on Staging',
    priority: 'P2',
    status: 'mitigated',
    assignedEngineer: 'Sarah Chen',
    affectedService: 'Supabase Realtime (Staging)',
    affectedCustomers: 0,
    openedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    resolvedAt: null,
    mttrMinutes: null,
    description: 'WebSocket connections to Supabase Realtime dropping every ~15 minutes on the Staging environment. Suspected connection pool exhaustion. Mitigation applied — monitoring for recurrence.',
    updates: [
      { time: '1h 20m ago', message: 'Connection pool limit increased from 50 to 200 — drops stopped' },
      { time: '2h 10m ago', message: 'Root cause identified: connection pool exhaustion under load test' },
      { time: '3h ago', message: 'Incident opened — realtime drops reported by QA team' },
    ],
  },
  {
    id: 'INC-045',
    title: 'AI Assistant response latency spike — P99 > 8s',
    priority: 'P2',
    status: 'open',
    assignedEngineer: 'Rahul Mehta',
    affectedService: 'OpenAI API / AI Assistant',
    affectedCustomers: 15,
    openedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    resolvedAt: null,
    mttrMinutes: null,
    description: 'P99 latency on the AI Assistant chat endpoint has spiked to 8.2s (SLA target: 3s). Suspected OpenAI API degradation. Fallback to cached responses being evaluated.',
    updates: [
      { time: '45 min ago', message: 'OpenAI status page shows elevated latency on gpt-4o-mini — external issue' },
      { time: '1h 30m ago', message: 'Incident opened — latency spike detected by APM alert' },
    ],
  },
  {
    id: 'INC-044',
    title: 'Redis cache miss rate elevated — 34% (baseline: 8%)',
    priority: 'P3',
    status: 'resolved',
    assignedEngineer: 'Priya Nair',
    affectedService: 'Redis Cache (Azure westeurope)',
    affectedCustomers: 3,
    openedAt: new Date(Date.now() - 28 * 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    mttrMinutes: 240,
    description: 'Redis cache miss rate elevated after memory limit was reached and LRU eviction kicked in. Cache warmed up after memory limit increase. Resolved.',
    updates: [
      { time: '24h ago', message: 'Cache miss rate back to 7% — incident resolved' },
      { time: '26h ago', message: 'Memory limit increased from 512MB to 1GB — cache warming' },
      { time: '28h ago', message: 'Incident opened — cache miss rate alert triggered' },
    ],
  },
  {
    id: 'INC-041',
    title: 'Deployment pipeline — Docker build timeout on Staging',
    priority: 'P3',
    status: 'resolved',
    assignedEngineer: 'Lavish Pandey',
    affectedService: 'CI/CD Pipeline (Azure DevOps)',
    affectedCustomers: 0,
    openedAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 4.8 * 24 * 3600000).toISOString(),
    mttrMinutes: 95,
    description: 'Docker build step timing out after 10 minutes on Staging pipeline. Root cause: large base image layer not cached. Fixed by pinning base image and enabling BuildKit cache.',
    updates: [
      { time: '4.8d ago', message: 'BuildKit cache enabled — build time reduced from 12m to 2m 30s' },
      { time: '5d ago', message: 'Incident opened — pipeline timeout alert' },
    ],
  },
];

function rowToPolicy(r: any): SLAPolicy {
  return {
    id: r.id, name: r.name, tier: r.tier,
    responseHours: r.response_hours, resolutionHours: r.resolution_hours,
    escalationHours: r.escalation_hours, isActive: r.is_active,
  };
}

function rowToBreach(r: any): SLABreach {
  return {
    id: r.id, customerId: r.customer_id, customerName: r.customer_name,
    tier: r.tier, policyName: r.policy_name, breachType: r.breach_type,
    slaHours: r.sla_hours, actualHours: r.actual_hours, breachHours: r.breach_hours,
    status: r.status, manager: r.manager, openedAt: r.opened_at, resolvedAt: r.resolved_at,
  };
}

function formatHours(h: number) {
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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

function IncidentCard({ incident }: { incident: Incident }) {
  const [expanded, setExpanded] = useState(false);
  const pCfg = PRIORITY_CONFIG[incident.priority];
  const sCfg = INCIDENT_STATUS_CONFIG[incident.status];
  const elapsed = incident.resolvedAt
    ? Math.round((new Date(incident.resolvedAt).getTime() - new Date(incident.openedAt).getTime()) / 60000)
    : Math.round((Date.now() - new Date(incident.openedAt).getTime()) / 60000);

  return (
    <div className={`bg-card border rounded-xl overflow-hidden ${incident.status === 'open' || incident.status === 'investigating' ? 'border-red-200' : 'border-border'}`}>
      <div
        className="px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start gap-3">
          <span className={`flex items-center gap-1 text-xs font-700 px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5 ${pCfg.bg} ${pCfg.color}`}>
            {pCfg.icon}{incident.priority}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-700 text-foreground">{incident.id} — {incident.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{incident.affectedService}</p>
              </div>
              <span className={`flex items-center gap-1.5 text-xs font-600 px-2 py-0.5 rounded-md flex-shrink-0 ${sCfg.bg} ${sCfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                {sCfg.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <User size={11} /> {incident.assignedEngineer}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={11} /> Opened {formatRelative(incident.openedAt)}
              </span>
              {incident.affectedCustomers > 0 && (
                <span className="text-xs font-600 text-red-600">{incident.affectedCustomers} customers affected</span>
              )}
              {incident.mttrMinutes !== null ? (
                <span className="flex items-center gap-1 text-xs text-green-700 font-600">
                  <CheckCircle size={11} /> MTTR: {incident.mttrMinutes >= 60 ? `${Math.floor(incident.mttrMinutes / 60)}h ${incident.mttrMinutes % 60}m` : `${incident.mttrMinutes}m`}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-700 font-600">
                  <Clock size={11} /> Elapsed: {elapsed >= 60 ? `${Math.floor(elapsed / 60)}h ${elapsed % 60}m` : `${elapsed}m`}
                </span>
              )}
            </div>
          </div>
          <ChevronDown size={14} className={`flex-shrink-0 text-muted-foreground transition-transform mt-1 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border bg-muted/10 px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-700 text-foreground mb-1">Description</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{incident.description}</p>
          </div>
          <div>
            <p className="text-xs font-700 text-foreground mb-2">Timeline</p>
            <div className="space-y-2">
              {incident.updates.map((u, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xs text-muted-foreground whitespace-nowrap w-20 flex-shrink-0">{u.time}</span>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <p className="text-xs text-foreground">{u.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SLATrackerPage() {
  const [policies, setPolicies] = useState<SLAPolicy[]>([]);
  const [breaches, setBreaches] = useState<SLABreach[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [notifSent, setNotifSent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sla' | 'incidents'>('sla');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'P1' | 'P2' | 'P3'>('all');
  const [incidentStatusFilter, setIncidentStatusFilter] = useState('all');
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pResult, bResult] = await Promise.all([
        supabase.from('sla_policies').select('*').order('tier'),
        supabase.from('sla_breaches').select('*').order('created_at', { ascending: false }),
      ]);
      const pData = pResult.data;
      const bData = bResult.data;
      if (pData) setPolicies(pData.map(rowToPolicy));
      if (bData) setBreaches(bData.map(rowToBreach));
    } catch (e) {
      console.error('SLA fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('sla_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sla_breaches' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const sendNotification = async (breach: SLABreach) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          type: 'sla_breach',
          to: 'admin@cois.app',
          data: {
            customerName: breach.customerName,
            tier: breach.tier,
            policyName: breach.policyName,
            breachType: breach.breachType,
            slaHours: breach.slaHours,
            actualHours: breach.actualHours,
          },
        }),
      });
      setNotifSent(breach.id);
      setTimeout(() => setNotifSent(null), 3000);
    } catch (e) {
      console.error('Notification error:', e);
    }
  };

  const filtered = breaches.filter(b => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchTier = tierFilter === 'all' || b.tier === tierFilter;
    return matchStatus && matchTier;
  });

  const filteredIncidents = MOCK_INCIDENTS.filter(inc => {
    const matchPriority = priorityFilter === 'all' || inc.priority === priorityFilter;
    const matchStatus = incidentStatusFilter === 'all' || inc.status === incidentStatusFilter;
    return matchPriority && matchStatus;
  });

  const stats = {
    total: breaches.length,
    breached: breaches.filter(b => b.status === 'breached').length,
    atRisk: breaches.filter(b => b.status === 'at_risk').length,
    resolved: breaches.filter(b => b.status === 'resolved').length,
  };

  const incidentStats = {
    open: MOCK_INCIDENTS.filter(i => i.status === 'open' || i.status === 'investigating').length,
    p1: MOCK_INCIDENTS.filter(i => i.priority === 'P1').length,
    p2: MOCK_INCIDENTS.filter(i => i.priority === 'P2').length,
    avgMttr: Math.round(MOCK_INCIDENTS.filter(i => i.mttrMinutes !== null).reduce((s, i) => s + (i.mttrMinutes || 0), 0) / MOCK_INCIDENTS.filter(i => i.mttrMinutes !== null).length),
  };

  return (
    <AppLayout title="SLA & Incident Management" subtitle="Service Level Agreement monitoring, P1/P2/P3 incidents, MTTR tracking, and assigned engineers">
      <div className="space-y-5">
        {/* Top-level tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
          {[
            { key: 'sla', label: 'SLA Tracker' },
            { key: 'incidents', label: `Incidents (${incidentStats.open} active)` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-1.5 rounded-md text-xs font-600 transition-all ${
                activeTab === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SLA TAB ── */}
        {activeTab === 'sla' && (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Cases', value: stats.total, color: 'text-foreground', bg: 'bg-muted' },
                { label: 'SLA Breached', value: stats.breached, color: 'text-red-700', bg: 'bg-red-50' },
                { label: 'At Risk', value: stats.atRisk, color: 'text-amber-700', bg: 'bg-amber-50' },
                { label: 'Resolved', value: stats.resolved, color: 'text-green-700', bg: 'bg-green-50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-border`}>
                  <p className={`text-2xl font-800 tabular-nums ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* SLA Policies */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <h3 className="text-sm font-700 text-foreground">SLA Policies</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Defined response and resolution targets by customer tier</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {['Policy', 'Tier', 'Response SLA', 'Resolution SLA', 'Escalation SLA', 'Status'].map(h => (
                        <th key={h} className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map((p, i) => (
                      <tr key={p.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                        <td className="px-5 py-3 text-xs font-700 text-foreground">{p.name}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-600 px-2 py-0.5 rounded-md ${TIER_COLORS[p.tier] || 'bg-gray-100 text-gray-600'}`}>{p.tier}</span>
                        </td>
                        <td className="px-5 py-3 text-xs font-600 text-foreground tabular-nums">{formatHours(p.responseHours)}</td>
                        <td className="px-5 py-3 text-xs font-600 text-foreground tabular-nums">{formatHours(p.resolutionHours)}</td>
                        <td className="px-5 py-3 text-xs font-600 text-foreground tabular-nums">{formatHours(p.escalationHours)}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-600 px-2 py-0.5 rounded-md ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {p.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Breach Tracker */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span className="text-sm font-700 text-foreground">Breach Cases</span>
                  <span className="text-xs text-muted-foreground">({filtered.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="pl-3 pr-7 py-1.5 text-xs rounded-lg border border-border bg-background outline-none appearance-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="breached">Breached</option>
                      <option value="at_risk">At Risk</option>
                      <option value="active">Active</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={tierFilter}
                      onChange={e => setTierFilter(e.target.value)}
                      className="pl-3 pr-7 py-1.5 text-xs rounded-lg border border-border bg-background outline-none appearance-none cursor-pointer"
                    >
                      <option value="all">All Tiers</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Mid-Market">Mid-Market</option>
                      <option value="SMB">SMB</option>
                    </select>
                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                  <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 text-muted-foreground hover:text-foreground border border-border rounded-lg bg-background hover:bg-muted transition-all">
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        {['Customer', 'Tier', 'Breach Type', 'SLA Target', 'Actual Time', 'Overdue By', 'Status', 'Manager', 'Opened', 'Action'].map(h => (
                          <th key={h} className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((b, i) => {
                        const cfg = STATUS_CONFIG[b.status];
                        const pct = Math.min((b.actualHours / b.slaHours) * 100, 100);
                        return (
                          <tr key={b.id} className={`border-b border-border last:border-0 hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                            <td className="px-4 py-3 text-xs font-700 text-foreground whitespace-nowrap">{b.customerName}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-600 px-2 py-0.5 rounded-md ${TIER_COLORS[b.tier] || 'bg-gray-100 text-gray-600'}`}>{b.tier}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-foreground capitalize">{b.breachType}</td>
                            <td className="px-4 py-3 text-xs font-600 text-foreground tabular-nums">{formatHours(b.slaHours)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-600 text-foreground tabular-nums">{formatHours(b.actualHours)}</span>
                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${b.status === 'breached' ? 'bg-red-500' : b.status === 'at_risk' ? 'bg-amber-500' : 'bg-green-500'}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-700 tabular-nums text-red-600">
                              {b.breachHours > 0 ? `+${formatHours(b.breachHours)}` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-600 px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{b.manager}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(b.openedAt)}</td>
                            <td className="px-4 py-3">
                              {b.status !== 'resolved' && (
                                <button
                                  onClick={() => sendNotification(b)}
                                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-600 rounded-lg border transition-all ${
                                    notifSent === b.id
                                      ? 'bg-green-50 border-green-200 text-green-700' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                                  }`}
                                >
                                  {notifSent === b.id ? <CheckCircle size={11} /> : <Mail size={11} />}
                                  {notifSent === b.id ? 'Sent' : 'Notify'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── INCIDENTS TAB ── */}
        {activeTab === 'incidents' && (
          <>
            {/* Incident KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Active Incidents', value: incidentStats.open, color: incidentStats.open > 0 ? 'text-red-700' : 'text-green-700', bg: incidentStats.open > 0 ? 'bg-red-50' : 'bg-green-50' },
                { label: 'P1 Critical', value: incidentStats.p1, color: 'text-red-700', bg: 'bg-red-50' },
                { label: 'P2 High', value: incidentStats.p2, color: 'text-amber-700', bg: 'bg-amber-50' },
                { label: 'Avg MTTR', value: `${incidentStats.avgMttr}m`, color: 'text-blue-700', bg: 'bg-blue-50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-border`}>
                  <p className={`text-2xl font-800 tabular-nums ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value as any)}
                  className="pl-3 pr-7 py-1.5 text-xs rounded-lg border border-border bg-background outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="P1">P1 — Critical</option>
                  <option value="P2">P2 — High</option>
                  <option value="P3">P3 — Medium</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={incidentStatusFilter}
                  onChange={e => setIncidentStatusFilter(e.target.value)}
                  className="pl-3 pr-7 py-1.5 text-xs rounded-lg border border-border bg-background outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="mitigated">Mitigated</option>
                  <option value="resolved">Resolved</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <span className="text-xs text-muted-foreground ml-auto">{filteredIncidents.length} incidents</span>
            </div>

            {/* Priority legend */}
            <div className="flex flex-wrap gap-3">
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-600 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                  {cfg.icon}{cfg.label}
                </div>
              ))}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-600 bg-muted text-muted-foreground border-border ml-auto">
                <Zap size={12} /> MTTR = Mean Time To Resolve
              </div>
            </div>

            {/* Incident Cards */}
            <div className="space-y-3">
              {filteredIncidents.map(incident => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
