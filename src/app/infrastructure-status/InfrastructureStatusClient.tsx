'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, Activity, Database, Globe, Shield, Cpu, Wifi, Cloud, Server, TrendingUp } from 'lucide-react';
import { useDemoSimulator, DemoSimulatorPanel } from '@/components/DemoEventSimulator';

type EnvHealth = 'healthy' | 'degraded' | 'down' | 'maintenance';
type ServiceStatus = 'up' | 'down' | 'degraded';

interface ServiceCheck {
  name: string;
  status: ServiceStatus;
  latency: number;
  uptime: string;
  icon: React.ReactNode;
  endpoint?: string;
}

interface Environment {
  id: string;
  name: string;
  health: EnvHealth;
  provider: 'AWS' | 'Azure' | 'GCP';
  region: string;
  regionCode: string;
  version: string;
  lastDeploy: string;
  deployedBy: string;
  uptime: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  activeConnections: number;
  requestsPerMin: number;
  errorRate: string;
  services: ServiceCheck[];
}

interface Incident {
  id: string;
  title: string;
  env: string;
  severity: 'P1' | 'P2' | 'P3';
  status: 'Active' | 'Investigating' | 'Resolved';
  assignee: string;
  time: string;
  duration: string;
}

const HEALTH_CONFIG: Record<EnvHealth, {
  color: string; bg: string; border: string; dot: string; label: string;
  headerBg: string; icon: React.ReactNode;
}> = {
  healthy:     { color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Healthy',     headerBg: 'bg-emerald-50/80',  icon: <CheckCircle2 size={14} /> },
  degraded:    { color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-300',   dot: 'bg-amber-500',   label: 'Degraded',    headerBg: 'bg-amber-50/80',    icon: <AlertTriangle size={14} /> },
  down:        { color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-300',     dot: 'bg-red-500',     label: 'Down',        headerBg: 'bg-red-50/80',      icon: <XCircle size={14} /> },
  maintenance: { color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200',    dot: 'bg-blue-500',    label: 'Maintenance', headerBg: 'bg-blue-50/80',     icon: <Clock size={14} /> },
};

const SERVICE_CONFIG: Record<ServiceStatus, { color: string; bg: string; dot: string; label: string }> = {
  up:       { color: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500', label: 'Operational' },
  down:     { color: 'text-red-700',     bg: 'bg-red-100',     dot: 'bg-red-500',     label: 'Down' },
  degraded: { color: 'text-amber-700',   bg: 'bg-amber-100',   dot: 'bg-amber-500',   label: 'Degraded' },
};

const PROVIDER_BADGE: Record<string, string> = {
  AWS:   'text-orange-700 bg-orange-100 border border-orange-200',
  Azure: 'text-blue-700 bg-blue-100 border border-blue-200',
  GCP:   'text-red-700 bg-red-100 border border-red-200',
};

const SEVERITY_BADGE: Record<string, string> = {
  P1: 'bg-red-600 text-white',
  P2: 'bg-amber-500 text-white',
  P3: 'bg-blue-500 text-white',
};

function makeEnvironments(): Environment[] {
  return [
    {
      id: 'prod', name: 'Production', health: 'healthy', provider: 'AWS',
      region: 'US East (N. Virginia)', regionCode: 'us-east-1',
      version: 'v2.4.7', lastDeploy: new Date(Date.now() - 24 * 3600000).toISOString(),
      deployedBy: 'Lavish Pandey', uptime: '99.97%',
      cpu: 34, memory: 61, disk: 42, network: 28,
      activeConnections: 847, requestsPerMin: 2340, errorRate: '0.02%',
      services: [
        { name: 'Next.js App',      status: 'up',       latency: 42,  uptime: '99.97%', icon: <Globe size={13} />,    endpoint: 'cois.app' },
        { name: 'Supabase DB',      status: 'up',       latency: 8,   uptime: '99.99%', icon: <Database size={13} />, endpoint: 'db.supabase.co' },
        { name: 'Redis Cache',      status: 'up',       latency: 2,   uptime: '100%',   icon: <Cpu size={13} />,      endpoint: 'cache.internal' },
        { name: 'CDN (CloudFront)', status: 'up',       latency: 12,  uptime: '100%',   icon: <Cloud size={13} />,    endpoint: 'cdn.cloudfront.net' },
        { name: 'Resend Email',     status: 'up',       latency: 180, uptime: '99.9%',  icon: <Wifi size={13} />,     endpoint: 'api.resend.com' },
        { name: 'Auth Service',     status: 'up',       latency: 15,  uptime: '99.98%', icon: <Shield size={13} />,   endpoint: 'auth.supabase.co' },
      ],
    },
    {
      id: 'staging', name: 'Staging', health: 'degraded', provider: 'Azure',
      region: 'West Europe (Amsterdam)', regionCode: 'westeurope',
      version: 'v2.5.0-rc.3', lastDeploy: new Date(Date.now() - 2 * 3600000).toISOString(),
      deployedBy: 'CI/CD Pipeline #246', uptime: '98.4%',
      cpu: 71, memory: 78, disk: 55, network: 62,
      activeConnections: 23, requestsPerMin: 145, errorRate: '1.8%',
      services: [
        { name: 'Next.js App',      status: 'up',       latency: 68,  uptime: '99.1%',  icon: <Globe size={13} />,    endpoint: 'staging.cois.app' },
        { name: 'Supabase DB',      status: 'up',       latency: 11,  uptime: '99.9%',  icon: <Database size={13} />, endpoint: 'db.supabase.co' },
        { name: 'Redis Cache',      status: 'degraded', latency: 340, uptime: '97.2%',  icon: <Cpu size={13} />,      endpoint: 'cache.internal' },
        { name: 'CDN (Azure CDN)',  status: 'up',       latency: 22,  uptime: '99.8%',  icon: <Cloud size={13} />,    endpoint: 'cdn.azure.net' },
        { name: 'Resend Email',     status: 'up',       latency: 195, uptime: '99.9%',  icon: <Wifi size={13} />,     endpoint: 'api.resend.com' },
        { name: 'Auth Service',     status: 'up',       latency: 18,  uptime: '99.7%',  icon: <Shield size={13} />,   endpoint: 'auth.supabase.co' },
      ],
    },
    {
      id: 'dev', name: 'Development', health: 'healthy', provider: 'AWS',
      region: 'Asia Pacific (Mumbai)', regionCode: 'ap-south-1',
      version: 'v2.5.0-dev', lastDeploy: new Date(Date.now() - 30 * 60000).toISOString(),
      deployedBy: 'CI/CD Pipeline #247', uptime: '96.1%',
      cpu: 18, memory: 44, disk: 31, network: 12,
      activeConnections: 4, requestsPerMin: 18, errorRate: '0.0%',
      services: [
        { name: 'Next.js App',  status: 'up', latency: 95,  uptime: '96.1%',  icon: <Globe size={13} />,    endpoint: 'dev.cois.app' },
        { name: 'Supabase DB',  status: 'up', latency: 14,  uptime: '99.5%',  icon: <Database size={13} />, endpoint: 'db.supabase.co' },
        { name: 'Redis Cache',  status: 'up', latency: 3,   uptime: '99.0%',  icon: <Cpu size={13} />,      endpoint: 'cache.internal' },
        { name: 'CDN',          status: 'up', latency: 30,  uptime: '99.0%',  icon: <Cloud size={13} />,    endpoint: 'cdn.cloudfront.net' },
        { name: 'Resend Email', status: 'up', latency: 210, uptime: '99.9%',  icon: <Wifi size={13} />,     endpoint: 'api.resend.com' },
        { name: 'Auth Service', status: 'up', latency: 20,  uptime: '99.0%',  icon: <Shield size={13} />,   endpoint: 'auth.supabase.co' },
      ],
    },
  ];
}

const INCIDENTS: Incident[] = [
  { id: 'INC-041', title: 'Redis cache latency spike — Staging (340ms avg)', env: 'Staging', severity: 'P2', status: 'Investigating', assignee: 'Rahul Mehta', time: '2h ago', duration: '2h 14m' },
  { id: 'INC-040', title: 'Elevated API response times — Production (>200ms p99)', env: 'Production', severity: 'P3', status: 'Resolved', assignee: 'Lavish Pandey', time: '3d ago', duration: '47m' },
  { id: 'INC-039', title: 'Supabase connection pool exhausted — Staging', env: 'Staging', severity: 'P2', status: 'Resolved', assignee: 'Sarah Chen', time: '5d ago', duration: '1h 22m' },
  { id: 'INC-038', title: 'CDN cache invalidation failure — Production', env: 'Production', severity: 'P3', status: 'Resolved', assignee: 'Priya Nair', time: '8d ago', duration: '18m' },
];

function ResourceBar({ value, label, color, unit = '%' }: { value: number; label: string; color: string; unit?: string }) {
  const barColor = value > 85 ? 'bg-red-500' : value > 70 ? 'bg-amber-500' : color;
  const textColor = value > 85 ? 'text-red-600 font-bold' : value > 70 ? 'text-amber-600 font-semibold' : 'text-foreground';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <span className={`text-xs tabular-nums font-bold ${textColor}`}>{value}{unit}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function LatencyBar({ value, max = 400 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value > 200 ? 'bg-red-500' : value > 100 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-mono font-bold tabular-nums w-12 text-right ${value > 200 ? 'text-red-600' : value > 100 ? 'text-amber-600' : 'text-emerald-700'}`}>{value}ms</span>
    </div>
  );
}

function formatRelative(iso: string) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
}

function UptimeSparkline({ uptime }: { uptime: string }) {
  const pct = parseFloat(uptime);
  const bars = 30;
  const failAt = Math.floor((1 - pct / 100) * bars);
  return (
    <div className="flex items-end gap-0.5 h-6">
      {Array.from({ length: bars }).map((_, i) => {
        const isFail = i === failAt && pct < 100;
        return (
          <div
            key={i}
            className={`w-1 rounded-sm ${isFail ? 'bg-red-400' : 'bg-emerald-400'}`}
            style={{ height: `${isFail ? 40 : 70 + Math.random() * 30}%` }}
          />
        );
      })}
    </div>
  );
}

// ── Deployment Status Check for Infrastructure ────────────────────────────────
function InfraDeploymentStatusCheck({ environments }: { environments: Environment[] }) {
  const allHealthy = environments.every(e => e.health === 'healthy');
  const anyDown = environments.some(e => e.health === 'down');
  const anyDegraded = environments.some(e => e.health === 'degraded');

  const checks = [
    { label: 'Production Health', ok: environments.find(e => e.id === 'prod')?.health === 'healthy', detail: environments.find(e => e.id === 'prod')?.uptime },
    { label: 'Staging Health', ok: environments.find(e => e.id === 'staging')?.health !== 'down', detail: environments.find(e => e.id === 'staging')?.uptime },
    { label: 'Dev Health', ok: environments.find(e => e.id === 'dev')?.health !== 'down', detail: environments.find(e => e.id === 'dev')?.uptime },
    { label: 'All Services Up', ok: environments.every(e => e.services.every(s => s.status !== 'down')), detail: `${environments.reduce((a, e) => a + e.services.filter(s => s.status === 'up').length, 0)}/${environments.reduce((a, e) => a + e.services.length, 0)} up` },
    { label: 'No Active Incidents', ok: INCIDENTS.filter(i => i.status !== 'Resolved').length === 0, detail: `${INCIDENTS.filter(i => i.status !== 'Resolved').length} open` },
    { label: 'Error Rate Normal', ok: !environments.some(e => parseFloat(e.errorRate) > 2), detail: `Max: ${Math.max(...environments.map(e => parseFloat(e.errorRate))).toFixed(2)}%` },
  ];

  const passCount = checks.filter(c => c.ok).length;

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${allHealthy ? 'border-emerald-200 bg-emerald-50/30' : anyDown ? 'border-red-200 bg-red-50/20' : 'border-amber-200 bg-amber-50/20'}`}>
      <div className={`px-4 sm:px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${allHealthy ? 'border-emerald-200' : anyDown ? 'border-red-200' : 'border-amber-200'}`}>
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${allHealthy ? 'bg-emerald-500' : anyDown ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
          <span className={`text-sm font-bold ${allHealthy ? 'text-emerald-700' : anyDown ? 'text-red-700' : 'text-amber-700'}`}>
            {allHealthy ? 'All Systems Operational' : anyDown ? 'Partial Outage Detected' : 'Minor Degradation Detected'}
          </span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${allHealthy ? 'bg-emerald-100 text-emerald-700' : anyDown ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
          {passCount}/{checks.length} checks passing
        </span>
      </div>
      <div className="px-4 sm:px-5 py-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
        {checks.map(check => (
          <div key={check.label} className="flex items-start gap-2">
            {check.ok
              ? <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              : <AlertTriangle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
            }
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground leading-tight">{check.label}</p>
              {check.detail && <p className="text-xs text-muted-foreground font-mono mt-0.5">{check.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InfrastructureStatusClient() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [expandedEnv, setExpandedEnv] = useState<string | null>('prod');
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'incidents'>('overview');
  const [liveMetrics, setLiveMetrics] = useState<Record<string, { cpu: number; mem: number; rpm: number }>>({});

  const { events: simEvents, running: simRunning, start: startSim, stop: stopSim, clear: clearSim, dbConnected } = useDemoSimulator(5000);

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const envs = makeEnvironments();
      setEnvironments(envs);
      setLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 600);
  }, []);

  useEffect(() => {
    const envs = makeEnvironments();
    setEnvironments(envs);
    setLoading(false);
    setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const interval = setInterval(refresh, 30000);
    const jitter = setInterval(() => {
      setLiveMetrics({
        prod:    { cpu: 30 + Math.floor(Math.random() * 12), mem: 58 + Math.floor(Math.random() * 8),  rpm: 2300 + Math.floor(Math.random() * 100) },
        staging: { cpu: 65 + Math.floor(Math.random() * 15), mem: 74 + Math.floor(Math.random() * 10), rpm: 130 + Math.floor(Math.random() * 30) },
        dev:     { cpu: 14 + Math.floor(Math.random() * 8),  mem: 40 + Math.floor(Math.random() * 8),  rpm: 15 + Math.floor(Math.random() * 8) },
      });
    }, 3000);
    return () => { clearInterval(interval); clearInterval(jitter); };
  }, [refresh]);

  const overallHealth = environments.every(e => e.health === 'healthy') ? 'All Systems Operational'
    : environments.some(e => e.health === 'down') ? 'Partial Outage'
    : 'Minor Degradation Detected';

  const overallStyle = environments.every(e => e.health === 'healthy')
    ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
    : environments.some(e => e.health === 'down')
    ? 'text-red-700 bg-red-50 border-red-300' : 'text-amber-700 bg-amber-50 border-amber-300';

  const totalServices = environments.reduce((acc, e) => acc + e.services.length, 0);
  const healthyServices = environments.reduce((acc, e) => acc + e.services.filter(s => s.status === 'up').length, 0);
  const degradedServices = environments.reduce((acc, e) => acc + e.services.filter(s => s.status === 'degraded').length, 0);

  return (
    <AppLayout title="Infrastructure Status" subtitle="Cloud environments — AWS · Azure · Real-time health monitoring">
      <div className="space-y-5">

        {/* Global Status Banner */}
        <div className={`flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3.5 rounded-xl border-2 ${overallStyle}`}>
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${environments.every(e => e.health === 'healthy') ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-sm font-bold">{overallHealth}</span>
          </div>
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <span className="text-xs opacity-70 hidden sm:block">Auto-refreshes every 30s</span>
            {lastRefreshed && <span className="text-xs opacity-60 hidden md:block font-mono">Updated {lastRefreshed}</span>}
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 text-xs font-semibold opacity-80 hover:opacity-100 transition-opacity bg-white/60 px-2.5 py-1 rounded-lg border border-current/20"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Environments', value: environments.length, sub: 'Active', color: 'text-foreground', bg: 'bg-card border-border', icon: <Server size={16} className="text-muted-foreground" /> },
            { label: 'Services Up', value: `${healthyServices}/${totalServices}`, sub: 'Operational', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 size={16} className="text-emerald-600" /> },
            { label: 'Degraded', value: degradedServices, sub: 'Need attention', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <AlertTriangle size={16} className="text-amber-500" /> },
            { label: 'Avg Uptime', value: '98.2%', sub: 'Last 30 days', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: <TrendingUp size={16} className="text-blue-600" /> },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border flex items-start gap-3`}>
              <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
              <div>
                <p className={`text-2xl font-black tabular-nums leading-none ${s.color}`}>{s.value}</p>
                <p className="text-xs font-semibold text-foreground mt-1">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Deployment Status Check */}
        {environments.length > 0 && <InfraDeploymentStatusCheck environments={environments} />}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1 w-full sm:w-fit overflow-x-auto">
          {([
            { key: 'overview', label: 'Overview' },
            { key: 'services', label: 'Services' },
            { key: 'incidents', label: `Incidents (${INCIDENTS.filter(i => i.status !== 'Resolved').length} active)` },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
            {environments.map(env => {
              const hCfg = HEALTH_CONFIG[env.health];
              const live = liveMetrics[env.id];
              const cpu = live?.cpu ?? env.cpu;
              const mem = live?.mem ?? env.memory;
              const rpm = live?.rpm ?? env.requestsPerMin;
              const isExpanded = expandedEnv === env.id;

              return (
                <div key={env.id} className={`bg-card border-2 rounded-xl overflow-hidden transition-all ${hCfg.border}`}>
                  {/* Card Header */}
                  <div className={`px-4 sm:px-5 py-4 ${hCfg.headerBg} border-b-2 ${hCfg.border}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${hCfg.dot} ${env.health === 'degraded' ? 'animate-pulse' : ''}`} />
                          <h3 className="text-base font-black text-foreground">{env.name}</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${PROVIDER_BADGE[env.provider]}`}>{env.provider}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">{env.region}</p>
                        <p className="text-xs font-mono text-muted-foreground/70">{env.regionCode}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border flex-shrink-0 ${hCfg.bg} ${hCfg.color} ${hCfg.border}`}>
                        {hCfg.icon} {hCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Meta Row */}
                  <div className="px-4 sm:px-5 py-3 border-b border-border grid grid-cols-2 gap-x-4 gap-y-2.5">
                    <div>
                      <p className="text-xs text-muted-foreground">Version</p>
                      <p className="text-xs font-bold font-mono text-foreground">{env.version}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Uptime (30d)</p>
                      <p className={`text-xs font-black ${parseFloat(env.uptime) > 99 ? 'text-emerald-700' : 'text-amber-700'}`}>{env.uptime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Deploy</p>
                      <p className="text-xs font-semibold text-foreground">{formatRelative(env.lastDeploy)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Connections</p>
                      <p className="text-xs font-black text-foreground tabular-nums">{env.activeConnections.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Req/min</p>
                      <p className="text-xs font-black text-foreground tabular-nums">{rpm.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Error Rate</p>
                      <p className={`text-xs font-black tabular-nums ${parseFloat(env.errorRate) > 1 ? 'text-red-600' : 'text-emerald-700'}`}>{env.errorRate}</p>
                    </div>
                  </div>

                  {/* Resource Usage */}
                  <div className="px-4 sm:px-5 py-3.5 border-b border-border space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-foreground">Resource Usage</p>
                      <span className="text-xs text-muted-foreground font-mono">Live</span>
                    </div>
                    <ResourceBar value={cpu}         label="CPU"     color="bg-blue-500" />
                    <ResourceBar value={mem}         label="Memory"  color="bg-violet-500" />
                    <ResourceBar value={env.disk}    label="Disk"    color="bg-slate-500" />
                    <ResourceBar value={env.network} label="Network" color="bg-cyan-500" />
                  </div>

                  {/* Services Toggle */}
                  <button
                    onClick={() => setExpandedEnv(isExpanded ? null : env.id)}
                    className="w-full px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-b border-border"
                  >
                    <span>Services ({env.services.filter(s => s.status === 'up').length}/{env.services.length} up)</span>
                    <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 py-3 space-y-2">
                      {env.services.map(svc => {
                        const sCfg = SERVICE_CONFIG[svc.status];
                        return (
                          <div key={svc.name} className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sCfg.dot} ${svc.status === 'degraded' ? 'animate-pulse' : ''}`} />
                            <span className="text-muted-foreground flex-shrink-0">{svc.icon}</span>
                            <span className="text-xs font-medium text-foreground flex-1 truncate">{svc.name}</span>
                            <LatencyBar value={svc.latency} />
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${sCfg.bg} ${sCfg.color}`}>{sCfg.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-4 sm:px-5 py-2.5 bg-muted/30 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground truncate min-w-0">
                      By <span className="font-semibold text-foreground">{env.deployedBy}</span>
                    </p>
                    <UptimeSparkline uptime={env.uptime} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-border flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              <span className="text-sm font-bold text-foreground">All Services Health Matrix</span>
              <span className="text-xs text-muted-foreground ml-auto">{healthyServices}/{totalServices} operational</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Service', 'Production', 'Staging', 'Development'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 sm:px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {environments[0]?.services.map((_, si) => (
                    <tr key={si} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 sm:px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{environments[0].services[si].icon}</span>
                          <span className="text-xs font-semibold text-foreground">{environments[0].services[si].name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 pl-5">{environments[0].services[si].endpoint}</p>
                      </td>
                      {environments.map(env => {
                        const svc = env.services[si];
                        const sCfg = SERVICE_CONFIG[svc.status];
                        return (
                          <td key={env.id} className="px-4 sm:px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${sCfg.dot} ${svc.status === 'degraded' ? 'animate-pulse' : ''}`} />
                              <span className={`text-xs font-bold ${sCfg.color}`}>{sCfg.label}</span>
                            </div>
                            <p className={`text-xs font-mono mt-0.5 ${svc.latency > 200 ? 'text-red-600 font-bold' : svc.latency > 100 ? 'text-amber-600' : 'text-muted-foreground'}`}>{svc.latency}ms</p>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Incidents Tab */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total', value: INCIDENTS.length, color: 'text-foreground', bg: 'bg-card border-border' },
                { label: 'Active', value: INCIDENTS.filter(i => i.status === 'Active').length, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
                { label: 'Investigating', value: INCIDENTS.filter(i => i.status === 'Investigating').length, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
                { label: 'Resolved', value: INCIDENTS.filter(i => i.status === 'Resolved').length, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-4 border`}>
                  <p className={`text-2xl font-black tabular-nums ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 border-b border-border flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-600" />
                <span className="text-sm font-bold text-foreground">Incident History</span>
              </div>
              <div className="divide-y divide-border">
                {INCIDENTS.map(inc => (
                  <div key={inc.id} className={`px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${inc.status !== 'Resolved' ? 'bg-amber-50/30' : ''}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md flex-shrink-0 ${SEVERITY_BADGE[inc.severity]}`}>{inc.severity}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{inc.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{inc.env}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">Assigned: <span className="font-medium text-foreground">{inc.assignee}</span></span>
                          <span className="text-xs text-muted-foreground hidden sm:inline">·</span>
                          <span className="text-xs text-muted-foreground hidden sm:inline">Duration: <span className="font-medium">{inc.duration}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                      <span className="text-xs text-muted-foreground font-mono">{inc.id}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${inc.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : inc.status === 'Active' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {inc.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{inc.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Demo Simulator */}
        <DemoSimulatorPanel
          events={simEvents}
          running={simRunning}
          onStart={startSim}
          onStop={stopSim}
          onClear={clearSim}
          dbConnected={dbConnected}
          maxVisible={10}
        />

        {/* Network Topology Card */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-border flex items-center gap-2">
            <Globe size={14} className="text-primary" />
            <span className="text-sm font-bold text-foreground">Network Topology</span>
            <span className="text-xs text-muted-foreground ml-auto">Multi-cloud · 3 regions</span>
          </div>
          <div className="px-4 sm:px-5 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'AWS us-east-1', role: 'Primary Production', latency: '42ms', status: 'healthy', icon: <Cloud size={16} className="text-orange-600" /> },
                { label: 'Azure westeurope', role: 'Staging / DR', latency: '68ms', status: 'degraded', icon: <Cloud size={16} className="text-blue-600" /> },
                { label: 'AWS ap-south-1', role: 'Development / APAC', latency: '95ms', status: 'healthy', icon: <Cloud size={16} className="text-orange-600" /> },
              ].map(node => (
                <div key={node.label} className={`rounded-xl border-2 p-4 ${node.status === 'degraded' ? 'border-amber-300 bg-amber-50/30' : 'border-emerald-200 bg-emerald-50/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {node.icon}
                    <span className="text-xs font-bold text-foreground">{node.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{node.role}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-mono font-bold text-foreground">{node.latency}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${node.status === 'degraded' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {node.status === 'degraded' ? 'Degraded' : 'Healthy'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
