'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import { AlertTriangle, CheckCircle, RefreshCw, ChevronDown, Mail } from 'lucide-react';

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

const STATUS_CONFIG = {
  breached: { label: 'Breached',  color: 'text-red-700',    bg: 'bg-red-100',    dot: 'bg-red-500' },
  at_risk:  { label: 'At Risk',   color: 'text-amber-700',  bg: 'bg-amber-100',  dot: 'bg-amber-500' },
  active:   { label: 'Active',    color: 'text-blue-700',   bg: 'bg-blue-100',   dot: 'bg-blue-500' },
  resolved: { label: 'Resolved',  color: 'text-green-700',  bg: 'bg-green-100',  dot: 'bg-green-500' },
};

const TIER_COLORS: Record<string, string> = {
  Enterprise: 'bg-violet-100 text-violet-700',
  'Mid-Market': 'bg-blue-100 text-blue-700',
  SMB: 'bg-slate-100 text-slate-700',
};

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

export default function SLATrackerPage() {
  const [policies, setPolicies] = useState<SLAPolicy[]>([]);
  const [breaches, setBreaches] = useState<SLABreach[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [notifSent, setNotifSent] = useState<string | null>(null);
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

  const stats = {
    total: breaches.length,
    breached: breaches.filter(b => b.status === 'breached').length,
    atRisk: breaches.filter(b => b.status === 'at_risk').length,
    resolved: breaches.filter(b => b.status === 'resolved').length,
  };

  return (
    <AppLayout title="SLA Tracker" subtitle="Service Level Agreement monitoring — response, resolution, and escalation compliance">
      <div className="space-y-5">
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
                                  ? 'bg-green-50 border-green-200 text-green-700' :'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted'
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
      </div>
    </AppLayout>
  );
}
