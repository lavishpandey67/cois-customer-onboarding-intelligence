'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Shield, Check, X, Activity, Database, Cpu, Wifi, AlertTriangle, CheckCircle, Clock, RefreshCw, Server, Zap, Mail, Send } from 'lucide-react';

interface NotifPref {
  label: string;
  description: string;
  enabled: boolean;
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  latency: number;
  uptime: number;
  icon: React.ReactNode;
}

interface SystemEvent {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  time: string;
}

function SystemHealthWidget() {
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const now = new Date();
    setLastRefreshed(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [tick]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setTick(t => t + 1);
    }, 900);
  };

  const services: ServiceStatus[] = [
    { name: 'Supabase Database', status: 'operational', latency: 42, uptime: 99.97, icon: <Database size={14} /> },
    { name: 'Authentication Service', status: 'operational', latency: 31, uptime: 99.99, icon: <Shield size={14} /> },
    { name: 'API Gateway', status: 'operational', latency: 58, uptime: 99.94, icon: <Wifi size={14} /> },
    { name: 'AI Assistant Engine', status: 'degraded', latency: 312, uptime: 98.21, icon: <Zap size={14} /> },
    { name: 'Analytics Pipeline', status: 'operational', latency: 74, uptime: 99.88, icon: <Activity size={14} /> },
    { name: 'Notification Service', status: 'operational', latency: 29, uptime: 99.95, icon: <Bell size={14} /> },
  ];

  const events: SystemEvent[] = [
    { id: 'ev-1', type: 'warning', message: 'AI Assistant Engine response time elevated (>300ms)', time: '14 min ago' },
    { id: 'ev-2', type: 'success', message: 'Supabase real-time subscriptions reconnected successfully', time: '1 hr ago' },
    { id: 'ev-3', type: 'info', message: 'Scheduled database vacuum completed — 3 tables optimised', time: '3 hr ago' },
    { id: 'ev-4', type: 'success', message: 'All services passed health check (automated)', time: '6 hr ago' },
    { id: 'ev-5', type: 'info', message: 'Analytics pipeline batch job completed — 15 customers synced', time: '9 hr ago' },
  ];

  const statusConfig = {
    operational: { label: 'Operational', color: 'text-green-600', bg: 'bg-green-100', dot: 'bg-green-500' },
    degraded: { label: 'Degraded', color: 'text-amber-600', bg: 'bg-amber-100', dot: 'bg-amber-500' },
    outage: { label: 'Outage', color: 'text-red-600', bg: 'bg-red-100', dot: 'bg-red-500' },
  };

  const eventConfig = {
    info: { icon: <Clock size={12} />, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    warning: { icon: <AlertTriangle size={12} />, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    success: { icon: <CheckCircle size={12} />, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    error: { icon: <AlertTriangle size={12} />, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
  };

  const degradedCount = services.filter(s => s.status === 'degraded').length;
  const outageCount = services.filter(s => s.status === 'outage').length;
  const overallStatus = outageCount > 0 ? 'outage' : degradedCount > 0 ? 'degraded' : 'operational';
  const overallConfig = statusConfig[overallStatus];
  const avgLatency = Math.round(services.reduce((sum, s) => sum + s.latency, 0) / services.length);
  const avgUptime = (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2);

  return (
    <div className="space-y-5">
      <div className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${
        overallStatus === 'operational' ? 'bg-green-50 border-green-200' :
        overallStatus === 'degraded' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${overallConfig.dot} animate-pulse`} />
          <div>
            <p className={`text-sm font-700 ${overallConfig.color}`}>
              {overallStatus === 'operational' ? 'All Systems Operational' :
               overallStatus === 'degraded' ? `${degradedCount} Service${degradedCount > 1 ? 's' : ''} Degraded` :
               `${outageCount} Service${outageCount > 1 ? 's' : ''} Down`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lastRefreshed ? `Last checked at ${lastRefreshed}` : 'Checking…'}
            </p>
          </div>
        </div>
        <button onClick={handleRefresh} className="flex items-center gap-1.5 text-xs font-600 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-white border border-border">
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Services Online', value: `${services.filter(s => s.status === 'operational').length}/${services.length}`, icon: <Server size={15} />, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg API Latency', value: `${avgLatency}ms`, icon: <Activity size={15} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Uptime (30d)', value: `${avgUptime}%`, icon: <Cpu size={15} />, color: 'text-primary', bg: 'bg-primary/5' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.color} flex-shrink-0`}>{kpi.icon}</div>
            <div>
              <p className="text-lg font-700 text-foreground leading-tight">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border"><h3 className="text-sm font-700 text-foreground">Service Status</h3></div>
        <div className="divide-y divide-border">
          {services.map(service => {
            const cfg = statusConfig[service.status];
            return (
              <div key={service.name} className="px-5 py-3 flex items-center gap-4">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">{service.icon}</div>
                <div className="flex-1 min-w-0"><p className="text-xs font-600 text-foreground">{service.name}</p></div>
                <div className="flex items-center gap-4 text-xs tabular-nums">
                  <span className="text-muted-foreground hidden sm:block"><span className="font-600 text-foreground">{service.latency}ms</span> latency</span>
                  <span className="text-muted-foreground hidden sm:block"><span className="font-600 text-foreground">{service.uptime}%</span> uptime</span>
                  <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-600 ${cfg.bg} ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border"><h3 className="text-sm font-700 text-foreground">Recent System Events</h3></div>
        <div className="p-4 space-y-2">
          {events.map(event => {
            const cfg = eventConfig[event.type];
            return (
              <div key={event.id} className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg}`}>
                <span className={`mt-0.5 flex-shrink-0 ${cfg.color}`}>{cfg.icon}</span>
                <p className="text-xs text-foreground flex-1">{event.message}</p>
                <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">{event.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NotificationTestWidget() {
  const supabase = createClient();
  const { profile } = useAuth();
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    if (profile?.email) setTestEmail(profile.email);
  }, [profile]);

  const sendTest = async () => {
    setSending(true);
    setSendError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          type: 'risk_alert',
          to: testEmail,
          data: {
            customerName: 'Vantage Capital Partners',
            tier: 'Enterprise',
            region: 'North America',
            issue: 'Compliance approval pending 18 days. Go Live at risk.',
            severity: 'Critical',
            daysSinceLastActivity: 18,
            revenueAtRisk: 180000,
            manager: 'Sarah Chen',
          },
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to send');
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch (err: any) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Mail size={14} className="text-primary" />
        <h3 className="text-sm font-700 text-foreground">Email Notification Test</h3>
      </div>
      <p className="text-xs text-muted-foreground">Send a test risk alert email via the Resend integration to verify the notification pipeline.</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={testEmail}
          onChange={e => setTestEmail(e.target.value)}
          placeholder="recipient@email.com"
          className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={sendTest}
          disabled={sending || !testEmail}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-600 rounded-lg transition-all ${
            sent ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50'
          }`}
        >
          {sending ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> :
           sent ? <CheckCircle size={12} /> : <Send size={12} />}
          {sending ? 'Sending…' : sent ? 'Sent!' : 'Send Test'}
        </button>
      </div>
      {sendError && <p className="text-xs text-red-600">{sendError}</p>}
    </div>
  );
}

export default function AdministrationPage() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'roles' | 'health' | 'email'>('notifications');
  const [prefs, setPrefs] = useState<NotifPref[]>([
    { label: 'Risk Alert Notifications', description: 'Receive alerts when customers are flagged as high or critical risk', enabled: true },
    { label: 'Milestone Completion Alerts', description: 'Get notified when customers complete key onboarding milestones', enabled: true },
    { label: 'Weekly AI Summary', description: 'Receive AI-generated weekly onboarding performance summary every Monday', enabled: true },
    { label: 'Task Escalation Alerts', description: 'Notifications when tasks are escalated or overdue by 3+ days', enabled: false },
    { label: 'Go Live Reminders', description: 'Reminders 7 days and 1 day before scheduled Go Live dates', enabled: true },
    { label: 'Health Score Drops', description: 'Alert when a customer health score drops by 10+ points in a week', enabled: false },
    { label: 'SLA Breach Alerts', description: 'Immediate notification when a customer SLA is breached', enabled: true },
    { label: 'Audit Log Digest', description: 'Daily digest of all admin actions and system events', enabled: false },
  ]);

  const togglePref = (i: number) => setPrefs(prev => prev.map((p, idx) => idx === i ? { ...p, enabled: !p.enabled } : p));

  return (
    <AppLayout title="Administration" subtitle="Notification preferences, role assignments, system health, and email configuration">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-4 flex-wrap">
          {([
            { id: 'notifications', label: 'Notification Preferences', icon: <Bell size={14} /> },
            { id: 'roles', label: 'Role Assignments', icon: <Shield size={14} /> },
            { id: 'email', label: 'Email Notifications', icon: <Mail size={14} /> },
            { id: 'health', label: 'System Health', icon: <Activity size={14} /> },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-600 transition-all duration-150 ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Notification Preferences */}
        {activeTab === 'notifications' && (
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs text-muted-foreground">Configure in-app notification preferences for your account</p>
            {prefs.map((pref, i) => (
              <div key={pref.label} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-700 text-foreground">{pref.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{pref.description}</p>
                </div>
                <button
                  onClick={() => togglePref(i)}
                  className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center px-0.5 flex-shrink-0 ${pref.enabled ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center">
                    {pref.enabled ? <Check size={9} className="text-primary" /> : <X size={9} className="text-muted-foreground" />}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Role Assignments */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            {[
              { role: 'Admin', color: 'bg-red-100 text-red-700', permissions: ['Full system access', 'User management', 'Audit log access', 'SLA configuration', 'Team invitations', 'All reports'], members: ['admin@cois.app'] },
              { role: 'CEO', color: 'bg-purple-100 text-purple-700', permissions: ['Executive dashboard', 'All reports', 'Analytics', 'Risk overview', 'AI insights'], members: ['ceo@cois.app'] },
              { role: 'Operations Director', color: 'bg-violet-100 text-violet-700', permissions: ['Full dashboard access', 'Risk alert management', 'Team administration', 'Report generation', 'AI insights access', 'SLA tracker'], members: ['ops@cois.app'] },
              { role: 'CS Manager', color: 'bg-blue-100 text-blue-700', permissions: ['Customer management', 'Task management', 'Milestone tracking', 'Risk flag creation', 'Report viewing'], members: ['csmanager@cois.app'] },
              { role: 'CS Specialist', color: 'bg-cyan-100 text-cyan-700', permissions: ['Customer viewing', 'Task updates', 'Timeline viewing', 'AI assistant'], members: ['specialist@cois.app'] },
              { role: 'Support Agent', color: 'bg-slate-100 text-slate-700', permissions: ['Customer viewing', 'Task updates', 'Notifications'], members: ['agent@cois.app'] },
            ].map(r => (
              <div key={r.role} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={14} className="text-primary" />
                      <span className={`text-xs font-700 px-2 py-0.5 rounded-md ${r.color}`}>{r.role}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {r.permissions.map(p => (
                        <span key={p} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">{p}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Assigned to:</span>
                      {r.members.map(m => (
                        <span key={m} className="text-xs font-600 text-foreground">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Email Notifications */}
        {activeTab === 'email' && (
          <div className="space-y-4 max-w-2xl">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-700 text-blue-800 mb-1">Email Notifications via Resend</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                COIS uses Resend to send transactional emails for risk alerts, SLA breaches, team invitations, and password resets.
                Configure your Resend API key in the edge function to enable real email delivery.
              </p>
            </div>
            <NotificationTestWidget />
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-700 text-foreground">Email Triggers</h3>
              {[
                { trigger: 'Risk Alert', description: 'Sent when a customer is flagged Critical or High risk', status: 'Active' },
                { trigger: 'SLA Breach', description: 'Sent when a customer exceeds their SLA threshold', status: 'Active' },
                { trigger: 'Team Invitation', description: 'Sent when a new team member is invited', status: 'Active' },
                { trigger: 'Password Reset', description: 'Sent when a user requests a password reset', status: 'Active' },
              ].map(t => (
                <div key={t.trigger} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-xs font-700 text-foreground">{t.trigger}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                  </div>
                  <span className="text-xs font-600 px-2 py-0.5 rounded-md bg-green-100 text-green-700">{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Health */}
        {activeTab === 'health' && <SystemHealthWidget />}
      </div>
    </AppLayout>
  );
}
