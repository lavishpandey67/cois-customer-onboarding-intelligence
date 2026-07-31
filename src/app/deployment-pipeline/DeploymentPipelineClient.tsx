'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { GitBranch, CheckCircle2, XCircle, Clock, Loader2, RefreshCw, ChevronDown, ChevronRight, Play, RotateCcw, Terminal, Zap, Package, TestTube2, Rocket, Shield, Activity, GitCommit, Timer, TrendingUp, AlertTriangle, ArrowRight, Eye, TrendingDown, BarChart2 } from 'lucide-react';
import { useDemoSimulator, DemoSimulatorPanel } from '@/components/DemoEventSimulator';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import StickyShareWidget from '@/components/StickyShareWidget';

type StageStatus = 'success' | 'failed' | 'running' | 'pending' | 'skipped';
type PipelineStatus = 'success' | 'failed' | 'running' | 'pending';

interface Stage {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: StageStatus;
  duration: string;
  startedAt: string;
  logs: string[];
}

interface Pipeline {
  id: string;
  runNumber: number;
  branch: string;
  commit: string;
  commitMessage: string;
  author: string;
  authorInitials: string;
  status: PipelineStatus;
  environment: string;
  triggeredBy: string;
  startedAt: string;
  duration: string;
  stages: Stage[];
}

const STAGE_ICONS: Record<string, React.ReactNode> = {
  'Source Checkout':   <GitBranch size={13} />,
  'Install Deps':      <Package size={13} />,
  'Lint & Type Check': <Shield size={13} />,
  'Unit Tests':        <TestTube2 size={13} />,
  'Build':             <Zap size={13} />,
  'Security Scan':     <Shield size={13} />,
  'Docker Build':      <Package size={13} />,
  'Deploy Staging':    <Rocket size={13} />,
  'Smoke Tests':       <Activity size={13} />,
  'Deploy Production': <Rocket size={13} />,
};

const STATUS_CONFIG: Record<StageStatus, { icon: React.ReactNode; color: string; bg: string; border: string; label: string }> = {
  success: { icon: <CheckCircle2 size={13} />, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', label: 'Passed' },
  failed:  { icon: <XCircle size={13} />,      color: 'text-red-700',     bg: 'bg-red-100',     border: 'border-red-200',     label: 'Failed' },
  running: { icon: <Loader2 size={13} className="animate-spin" />, color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200', label: 'Running' },
  pending: { icon: <Clock size={13} />,         color: 'text-slate-500',   bg: 'bg-slate-100',   border: 'border-slate-200',   label: 'Queued' },
  skipped: { icon: <ChevronRight size={13} />,  color: 'text-slate-400',   bg: 'bg-slate-50',    border: 'border-slate-100',   label: 'Skipped' },
};

const PIPELINE_STATUS_CONFIG: Record<PipelineStatus, { color: string; bg: string; border: string; dot: string; label: string; rowBg: string }> = {
  success: { color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Passed',  rowBg: '' },
  failed:  { color: 'text-red-700',     bg: 'bg-red-100',     border: 'border-red-200',     dot: 'bg-red-500',     label: 'Failed',  rowBg: 'bg-red-50/20' },
  running: { color: 'text-blue-700',    bg: 'bg-blue-100',    border: 'border-blue-200',    dot: 'bg-blue-500',    label: 'Running', rowBg: 'bg-blue-50/20' },
  pending: { color: 'text-slate-500',   bg: 'bg-slate-100',   border: 'border-slate-200',   dot: 'bg-slate-400',   label: 'Queued',  rowBg: '' },
};

function makePipelines(): Pipeline[] {
  return [
    {
      id: 'pl-247', runNumber: 247, branch: 'main', commit: 'a3f9c12',
      commitMessage: 'feat: add SLA breach real-time notifications',
      author: 'Lavish Pandey', authorInitials: 'LP',
      status: 'running', environment: 'Production', triggeredBy: 'push → main',
      startedAt: new Date(Date.now() - 4 * 60000).toISOString(), duration: '4m 12s',
      stages: [
        { id: 's1', name: 'Source Checkout',   icon: STAGE_ICONS['Source Checkout'],   status: 'success', duration: '8s',    startedAt: new Date(Date.now() - 4*60000).toISOString(), logs: ['✓ Cloned repo @ a3f9c12', '✓ Workspace initialized', '✓ Submodules updated'] },
        { id: 's2', name: 'Install Deps',      icon: STAGE_ICONS['Install Deps'],      status: 'success', duration: '42s',   startedAt: '', logs: ['✓ npm ci — 847 packages installed', '✓ Cache hit: node_modules (2.1 GB)', '✓ Peer dependencies resolved'] },
        { id: 's3', name: 'Lint & Type Check', icon: STAGE_ICONS['Lint & Type Check'], status: 'success', duration: '18s',   startedAt: '', logs: ['✓ ESLint: 0 errors, 2 warnings', '✓ tsc: no type errors (strict mode)', '✓ Prettier: all files formatted'] },
        { id: 's4', name: 'Unit Tests',        icon: STAGE_ICONS['Unit Tests'],        status: 'success', duration: '1m 4s', startedAt: '', logs: ['✓ 142 tests passed (0 failed)', '✓ Coverage: 84.2% (threshold: 80%)', '✓ Snapshot tests: 18 passed'] },
        { id: 's5', name: 'Build',             icon: STAGE_ICONS['Build'],             status: 'success', duration: '55s',   startedAt: '', logs: ['✓ Next.js build complete', '✓ Bundle: 312 kB (gzip)', '✓ 47 pages generated', '✓ ISR routes configured'] },
        { id: 's6', name: 'Security Scan',     icon: STAGE_ICONS['Security Scan'],     status: 'success', duration: '22s',   startedAt: '', logs: ['✓ Snyk: 0 critical, 1 low (accepted)', '✓ OWASP dependency check passed', '✓ Secrets scan: no leaks detected'] },
        { id: 's7', name: 'Docker Build',      icon: STAGE_ICONS['Docker Build'],      status: 'running', duration: '—',     startedAt: '', logs: ['→ Building image cois-app:a3f9c12', '→ Layer 4/7 in progress…', '→ Pushing to ECR: 892.cois.ecr.aws'] },
        { id: 's8', name: 'Deploy Staging',    icon: STAGE_ICONS['Deploy Staging'],    status: 'pending', duration: '—',     startedAt: '', logs: [] },
        { id: 's9', name: 'Smoke Tests',       icon: STAGE_ICONS['Smoke Tests'],       status: 'pending', duration: '—',     startedAt: '', logs: [] },
        { id: 's10',name: 'Deploy Production', icon: STAGE_ICONS['Deploy Production'], status: 'pending', duration: '—',     startedAt: '', logs: [] },
      ],
    },
    {
      id: 'pl-246', runNumber: 246, branch: 'feature/ai-chat-history', commit: 'b7e2d45',
      commitMessage: 'feat: persist AI chat sessions to Supabase',
      author: 'Lavish Pandey', authorInitials: 'LP',
      status: 'success', environment: 'Staging', triggeredBy: 'pull_request #84',
      startedAt: new Date(Date.now() - 2 * 3600000).toISOString(), duration: '7m 38s',
      stages: [
        { id: 's1', name: 'Source Checkout',   icon: STAGE_ICONS['Source Checkout'],   status: 'success', duration: '7s',    startedAt: '', logs: ['✓ Cloned repo @ b7e2d45', '✓ PR #84 merge commit checked out'] },
        { id: 's2', name: 'Install Deps',      icon: STAGE_ICONS['Install Deps'],      status: 'success', duration: '38s',   startedAt: '', logs: ['✓ 847 packages installed', '✓ Cache restored from main branch'] },
        { id: 's3', name: 'Lint & Type Check', icon: STAGE_ICONS['Lint & Type Check'], status: 'success', duration: '21s',   startedAt: '', logs: ['✓ ESLint: 0 errors', '✓ tsc: no type errors'] },
        { id: 's4', name: 'Unit Tests',        icon: STAGE_ICONS['Unit Tests'],        status: 'success', duration: '1m 8s', startedAt: '', logs: ['✓ 142 tests passed', '✓ Coverage: 84.2%', '✓ New tests: 6 added for chat history'] },
        { id: 's5', name: 'Build',             icon: STAGE_ICONS['Build'],             status: 'success', duration: '58s',   startedAt: '', logs: ['✓ Build complete', '✓ Bundle: 315 kB (gzip)'] },
        { id: 's6', name: 'Security Scan',     icon: STAGE_ICONS['Security Scan'],     status: 'success', duration: '19s',   startedAt: '', logs: ['✓ 0 critical vulnerabilities', '✓ OWASP check passed'] },
        { id: 's7', name: 'Docker Build',      icon: STAGE_ICONS['Docker Build'],      status: 'success', duration: '1m 2s', startedAt: '', logs: ['✓ Image built: cois-app:b7e2d45', '✓ Pushed to Azure Container Registry'] },
        { id: 's8', name: 'Deploy Staging',    icon: STAGE_ICONS['Deploy Staging'],    status: 'success', duration: '2m 4s', startedAt: '', logs: ['✓ Deployed to staging.cois.app', '✓ Health check: 200 OK (42ms)', '✓ Smoke tests triggered'] },
        { id: 's9', name: 'Smoke Tests',       icon: STAGE_ICONS['Smoke Tests'],       status: 'success', duration: '44s',   startedAt: '', logs: ['✓ 12/12 smoke tests passed', '✓ Auth flow: OK', '✓ API endpoints: OK'] },
        { id: 's10',name: 'Deploy Production', icon: STAGE_ICONS['Deploy Production'], status: 'skipped', duration: '—',     startedAt: '', logs: ['⊘ Skipped — PR branch, not main', '⊘ Production deploy requires main branch'] },
      ],
    },
    {
      id: 'pl-245', runNumber: 245, branch: 'fix/sla-seed-ids', commit: 'c1a8f33',
      commitMessage: 'fix: correct SLA breach seed customer IDs',
      author: 'Lavish Pandey', authorInitials: 'LP',
      status: 'failed', environment: 'Staging', triggeredBy: 'push → fix/sla-seed-ids',
      startedAt: new Date(Date.now() - 5 * 3600000).toISOString(), duration: '3m 11s',
      stages: [
        { id: 's1', name: 'Source Checkout',   icon: STAGE_ICONS['Source Checkout'],   status: 'success', duration: '9s',     startedAt: '', logs: ['✓ Cloned repo @ c1a8f33'] },
        { id: 's2', name: 'Install Deps',      icon: STAGE_ICONS['Install Deps'],      status: 'success', duration: '41s',    startedAt: '', logs: ['✓ 847 packages installed'] },
        { id: 's3', name: 'Lint & Type Check', icon: STAGE_ICONS['Lint & Type Check'], status: 'success', duration: '17s',    startedAt: '', logs: ['✓ ESLint: 0 errors'] },
        { id: 's4', name: 'Unit Tests',        icon: STAGE_ICONS['Unit Tests'],        status: 'failed',  duration: '1m 44s', startedAt: '', logs: ['✗ FAIL src/__tests__/sla.test.ts', '✗ Expected customer_id "cust-001" but received "c-001"', '✗ Expected customer_id "cust-002" but received "c-002"', '✗ 3 tests failed, 139 passed', '✗ Pipeline halted — test gate failed'] },
        { id: 's5', name: 'Build',             icon: STAGE_ICONS['Build'],             status: 'skipped', duration: '—',      startedAt: '', logs: ['⊘ Skipped — upstream stage failed'] },
        { id: 's6', name: 'Security Scan',     icon: STAGE_ICONS['Security Scan'],     status: 'skipped', duration: '—',      startedAt: '', logs: [] },
        { id: 's7', name: 'Docker Build',      icon: STAGE_ICONS['Docker Build'],      status: 'skipped', duration: '—',      startedAt: '', logs: [] },
        { id: 's8', name: 'Deploy Staging',    icon: STAGE_ICONS['Deploy Staging'],    status: 'skipped', duration: '—',      startedAt: '', logs: [] },
        { id: 's9', name: 'Smoke Tests',       icon: STAGE_ICONS['Smoke Tests'],       status: 'skipped', duration: '—',      startedAt: '', logs: [] },
        { id: 's10',name: 'Deploy Production', icon: STAGE_ICONS['Deploy Production'], status: 'skipped', duration: '—',      startedAt: '', logs: [] },
      ],
    },
    {
      id: 'pl-244', runNumber: 244, branch: 'main', commit: 'd4b1e90',
      commitMessage: 'feat: skeleton loaders + error boundary',
      author: 'Lavish Pandey', authorInitials: 'LP',
      status: 'success', environment: 'Production', triggeredBy: 'push → main',
      startedAt: new Date(Date.now() - 24 * 3600000).toISOString(), duration: '8m 02s',
      stages: [
        { id: 's1', name: 'Source Checkout',   icon: STAGE_ICONS['Source Checkout'],   status: 'success', duration: '8s',     startedAt: '', logs: ['✓ Cloned repo @ d4b1e90'] },
        { id: 's2', name: 'Install Deps',      icon: STAGE_ICONS['Install Deps'],      status: 'success', duration: '40s',    startedAt: '', logs: ['✓ 847 packages installed'] },
        { id: 's3', name: 'Lint & Type Check', icon: STAGE_ICONS['Lint & Type Check'], status: 'success', duration: '16s',    startedAt: '', logs: ['✓ ESLint: 0 errors'] },
        { id: 's4', name: 'Unit Tests',        icon: STAGE_ICONS['Unit Tests'],        status: 'success', duration: '1m 5s',  startedAt: '', logs: ['✓ 142 tests passed', '✓ Coverage: 84.2%'] },
        { id: 's5', name: 'Build',             icon: STAGE_ICONS['Build'],             status: 'success', duration: '57s',    startedAt: '', logs: ['✓ Build complete', '✓ Bundle: 312 kB'] },
        { id: 's6', name: 'Security Scan',     icon: STAGE_ICONS['Security Scan'],     status: 'success', duration: '20s',    startedAt: '', logs: ['✓ 0 critical vulnerabilities'] },
        { id: 's7', name: 'Docker Build',      icon: STAGE_ICONS['Docker Build'],      status: 'success', duration: '1m 3s',  startedAt: '', logs: ['✓ Image built: cois-app:d4b1e90', '✓ Pushed to ECR'] },
        { id: 's8', name: 'Deploy Staging',    icon: STAGE_ICONS['Deploy Staging'],    status: 'success', duration: '2m 1s',  startedAt: '', logs: ['✓ Deployed to staging', '✓ Health check passed'] },
        { id: 's9', name: 'Smoke Tests',       icon: STAGE_ICONS['Smoke Tests'],       status: 'success', duration: '42s',    startedAt: '', logs: ['✓ 12/12 smoke tests passed'] },
        { id: 's10',name: 'Deploy Production', icon: STAGE_ICONS['Deploy Production'], status: 'success', duration: '1m 50s', startedAt: '', logs: ['✓ Deployed to production (AWS us-east-1)', '✓ CDN cache purged (CloudFront)', '✓ Health check: 200 OK (42ms)', '✓ Rollback checkpoint saved: v2.4.6'] },
      ],
    },
  ];
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

function PipelineProgressBar({ stages }: { stages: Stage[] }) {
  const done = stages.filter(s => s.status === 'success').length;
  const failed = stages.filter(s => s.status === 'failed').length;
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex">
        {stages.map(s => {
          const color = s.status === 'success' ? 'bg-emerald-500'
            : s.status === 'failed' ? 'bg-red-500'
            : s.status === 'running' ? 'bg-blue-500 animate-pulse'
            : s.status === 'skipped'? 'bg-slate-300' :'bg-muted-foreground/20';
          return <div key={s.id} className={`flex-1 ${color}`} style={{ marginRight: '1px' }} />;
        })}
      </div>
      <span className="text-xs font-mono text-muted-foreground tabular-nums">{done}/{stages.length}</span>
      {failed > 0 && <span className="text-xs font-bold text-red-600">{failed} failed</span>}
    </div>
  );
}

function StagePill({ stage }: { stage: Stage }) {
  const cfg = STATUS_CONFIG[stage.status];
  return (
    <div
      title={`${stage.name}: ${cfg.label}${stage.duration !== '—' ? ` (${stage.duration})` : ''}`}
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border} whitespace-nowrap`}
    >
      {cfg.icon}
      <span className="hidden xl:inline">{stage.name}</span>
    </div>
  );
}

function StageLogPanel({ stage }: { stage: Stage }) {
  const cfg = STATUS_CONFIG[stage.status];
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className={`flex items-center gap-2 px-3 py-2 border-b border-border ${cfg.bg}`}>
        <span className={cfg.color}>{cfg.icon}</span>
        <span className={`text-xs font-bold ${cfg.color}`}>{stage.name}</span>
        {stage.duration !== '—' && (
          <span className="ml-auto text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Timer size={10} />{stage.duration}
          </span>
        )}
      </div>
      <div className="bg-slate-950 p-3 min-h-[64px]">
        {stage.logs.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono italic">Waiting to start…</p>
        ) : (
          stage.logs.map((line, i) => (
            <p
              key={i}
              className={`text-xs font-mono leading-relaxed ${
                line.startsWith('✗') ? 'text-red-400'
                : line.startsWith('→') ? 'text-blue-400'
                : line.startsWith('⊘') ? 'text-slate-500'
                : line.startsWith('!') ? 'text-amber-400'
                : 'text-emerald-400'
              }`}
            >
              {line}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

// ── Deployment Status Check Component ─────────────────────────────────────────
interface DeploymentStatusCheckProps {
  pipelines: Pipeline[];
}

function DeploymentStatusCheck({ pipelines }: DeploymentStatusCheckProps) {
  const latest = pipelines[0];
  const lastSuccess = pipelines.find(p => p.status === 'success');
  const hasRunning = pipelines.some(p => p.status === 'running');
  const hasFailed = pipelines.some(p => p.status === 'failed');

  const overallStatus = hasRunning ? 'deploying' : hasFailed ? 'degraded' : 'healthy';

  const statusConfig = {
    deploying: { label: 'Deployment In Progress', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300', dot: 'bg-blue-500 animate-pulse', icon: <Loader2 size={14} className="animate-spin text-blue-600" /> },
    degraded:  { label: 'Deployment Issues Detected', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', dot: 'bg-amber-500 animate-pulse', icon: <AlertTriangle size={14} className="text-amber-600" /> },
    healthy:   { label: 'All Deployments Healthy', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', dot: 'bg-emerald-500', icon: <CheckCircle2 size={14} className="text-emerald-600" /> },
  };

  const cfg = statusConfig[overallStatus];

  return (
    <div className={`rounded-xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden`}>
      <div className={`px-4 sm:px-5 py-3.5 border-b ${cfg.border} flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
          {cfg.icon}
          <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-mono hidden sm:block">
            Last checked: just now
          </span>
        </div>
      </div>
      <div className="px-4 sm:px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Run */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Run</p>
          {latest ? (
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${PIPELINE_STATUS_CONFIG[latest.status].bg} ${PIPELINE_STATUS_CONFIG[latest.status].color} ${PIPELINE_STATUS_CONFIG[latest.status].border}`}>
                  {PIPELINE_STATUS_CONFIG[latest.status].label}
                </span>
                <span className="text-xs font-mono text-muted-foreground">#{latest.runNumber}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{latest.commitMessage}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{latest.commit} · {latest.branch}</p>
            </div>
          ) : <p className="text-xs text-muted-foreground">No runs found</p>}
        </div>

        {/* Last Successful Deploy */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Successful Deploy</p>
          {lastSuccess ? (
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-bold text-emerald-700">#{lastSuccess.runNumber}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  lastSuccess.environment === 'Production' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'
                }`}>{lastSuccess.environment}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{formatRelative(lastSuccess.startedAt)}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{lastSuccess.commit} · {lastSuccess.duration}</p>
            </div>
          ) : <p className="text-xs text-muted-foreground">No successful deploys</p>}
        </div>

        {/* Stage Gate Status */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stage Gates</p>
          {latest && (
            <div className="space-y-1">
              {[
                { name: 'Tests', stages: ['Unit Tests'], icon: <TestTube2 size={10} /> },
                { name: 'Security', stages: ['Security Scan'], icon: <Shield size={10} /> },
                { name: 'Build', stages: ['Build', 'Docker Build'], icon: <Zap size={10} /> },
                { name: 'Deploy', stages: ['Deploy Staging', 'Deploy Production'], icon: <Rocket size={10} /> },
              ].map(gate => {
                const gateStages = latest.stages.filter(s => gate.stages.includes(s.name));
                const allPassed = gateStages.every(s => s.status === 'success');
                const anyFailed = gateStages.some(s => s.status === 'failed');
                const anyRunning = gateStages.some(s => s.status === 'running');
                const gateStatus = anyFailed ? 'failed' : anyRunning ? 'running' : allPassed ? 'success' : 'pending';
                const gateCfg = STATUS_CONFIG[gateStatus];
                return (
                  <div key={gate.name} className="flex items-center gap-2">
                    <span className={`${gateCfg.color}`}>{gateCfg.icon}</span>
                    <span className="text-muted-foreground">{gate.icon}</span>
                    <span className="text-xs font-medium text-foreground">{gate.name}</span>
                    <span className={`ml-auto text-xs font-bold ${gateCfg.color}`}>{gateCfg.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline Trend Data ──────────────────────────────────────────────────────
const buildDurationData = [
  { day: 'Mon', duration: 7.2, p95: 9.1 },
  { day: 'Tue', duration: 6.8, p95: 8.7 },
  { day: 'Wed', duration: 7.5, p95: 9.4 },
  { day: 'Thu', duration: 6.4, p95: 8.2 },
  { day: 'Fri', duration: 6.1, p95: 7.9 },
  { day: 'Sat', duration: 5.9, p95: 7.6 },
  { day: 'Sun', duration: 6.3, p95: 8.0 },
];

const stageSuccessData = [
  { stage: 'Checkout',  rate: 100 },
  { stage: 'Install',   rate: 99 },
  { stage: 'Lint',      rate: 97 },
  { stage: 'Tests',     rate: 94 },
  { stage: 'Build',     rate: 98 },
  { stage: 'Security',  rate: 96 },
  { stage: 'Docker',    rate: 95 },
  { stage: 'Staging',   rate: 93 },
  { stage: 'Smoke',     rate: 91 },
  { stage: 'Prod',      rate: 89 },
];

const avgDeployTimeData = [
  { week: 'W20', avgTime: 8.4, target: 7.0 },
  { week: 'W21', avgTime: 7.9, target: 7.0 },
  { week: 'W22', avgTime: 7.2, target: 7.0 },
  { week: 'W23', avgTime: 6.8, target: 7.0 },
  { week: 'W24', avgTime: 6.5, target: 7.0 },
  { week: 'W25', avgTime: 6.3, target: 7.0 },
  { week: 'W26', avgTime: 6.1, target: 7.0 },
];

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--foreground)',
};

export default function DeploymentPipelineClient() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>('pl-247');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'running' | 'failed'>('all');

  const { events: simEvents, running: simRunning, start: startSim, stop: stopSim, clear: clearSim, dbConnected } = useDemoSimulator(4000);

  useEffect(() => {
    setPipelines(makePipelines());
    setLoading(false);
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => { setPipelines(makePipelines()); setLoading(false); }, 600);
  }, []);

  const filtered = pipelines.filter(p => {
    if (activeTab === 'running') return p.status === 'running';
    if (activeTab === 'failed') return p.status === 'failed';
    return true;
  });

  const stats = {
    total: pipelines.length,
    running: pipelines.filter(p => p.status === 'running').length,
    success: pipelines.filter(p => p.status === 'success').length,
    failed: pipelines.filter(p => p.status === 'failed').length,
  };

  const successRate = (stats.success + stats.failed) > 0
    ? Math.round((stats.success / (stats.success + stats.failed)) * 100)
    : 0;

  const avgDuration = '6m 28s';

  return (
    <>
      <AppLayout title="Deployment Pipeline" subtitle="CI/CD — GitHub Actions · Azure DevOps · Docker · Kubernetes">
        <div className="space-y-5">

          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: 'Total Runs', value: stats.total, sub: 'Last 7 days',
                color: 'text-foreground', bg: 'bg-card border-border',
                icon: <GitBranch size={16} className="text-muted-foreground" />,
              },
              {
                label: 'Running', value: stats.running, sub: 'In progress',
                color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200',
                icon: <Loader2 size={16} className={`text-blue-600 ${stats.running > 0 ? 'animate-spin' : ''}`} />,
                pulse: stats.running > 0,
              },
              {
                label: 'Success Rate', value: `${successRate}%`, sub: `${stats.success} passed`,
                color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200',
                icon: <TrendingUp size={16} className="text-emerald-600" />,
              },
              {
                label: 'Failed', value: stats.failed, sub: `Avg: ${avgDuration}`,
                color: stats.failed > 0 ? 'text-red-700' : 'text-foreground',
                bg: stats.failed > 0 ? 'bg-red-50 border-red-200' : 'bg-card border-border',
                icon: <AlertTriangle size={16} className={stats.failed > 0 ? 'text-red-600' : 'text-muted-foreground'} />,
              },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 border flex items-start gap-3`}>
                <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-black tabular-nums leading-none ${s.color}`}>{s.value}</p>
                    {(s as any).pulse && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                  </div>
                  <p className="text-xs font-semibold text-foreground mt-1">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Deployment Status Check */}
          {!loading && <DeploymentStatusCheck pipelines={pipelines} />}

          {/* Demo Simulator */}
          <DemoSimulatorPanel
            events={simEvents}
            running={simRunning}
            onStart={startSim}
            onStop={stopSim}
            onClear={clearSim}
            dbConnected={dbConnected}
            maxVisible={15}
          />

          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
              {(['all', 'running', 'failed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'all' ? `All (${stats.total})` : tab === 'running' ? `Running (${stats.running})` : `Failed (${stats.failed})`}
                </button>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl bg-card hover:bg-muted transition-all"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Pipeline List */}
          <div className="space-y-3">
            {filtered.map(pipeline => {
              const pCfg = PIPELINE_STATUS_CONFIG[pipeline.status];
              const isExpanded = expandedId === pipeline.id;
              const stagesComplete = pipeline.stages.filter(s => s.status === 'success').length;

              return (
                <div
                  key={pipeline.id}
                  className={`bg-card border-2 rounded-xl overflow-hidden transition-all ${
                    pipeline.status === 'running' ? 'border-blue-300' :
                    pipeline.status === 'failed'? 'border-red-200' : 'border-border'
                  }`}
                >
                  {/* Pipeline Header */}
                  <div
                    className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors ${pCfg.rowBg}`}
                    onClick={() => setExpandedId(isExpanded ? null : pipeline.id)}
                  >
                    {/* Status Badge */}
                    <div className="flex-shrink-0 mt-0.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border ${pCfg.bg} ${pCfg.color} ${pCfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot} ${pipeline.status === 'running' ? 'animate-pulse' : ''}`} />
                        {pCfg.label}
                      </span>
                    </div>

                    {/* Pipeline Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-foreground">Run #{pipeline.runNumber}</span>
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded-md">{pipeline.branch}</span>
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <GitCommit size={10} />{pipeline.commit}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                          pipeline.environment === 'Production' ? 'bg-violet-100 text-violet-700 border border-violet-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {pipeline.environment}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate font-medium">{pipeline.commitMessage}</p>

                      {/* Stage Pills — hidden on mobile, shown on md+ */}
                      <div className="mt-2.5 hidden md:flex items-center gap-1 flex-wrap">
                        {pipeline.stages.map((stage, i) => (
                          <React.Fragment key={stage.id}>
                            <StagePill stage={stage} />
                            {i < pipeline.stages.length - 1 && (
                              <ArrowRight size={9} className="text-muted-foreground/50 flex-shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Progress Bar — shown on mobile */}
                      <div className="md:hidden">
                        <PipelineProgressBar stages={pipeline.stages} />
                      </div>
                    </div>

                    {/* Right Meta */}
                    <div className="flex-shrink-0 text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground font-mono">{formatRelative(pipeline.startedAt)}</p>
                      <p className="text-xs font-bold text-foreground mt-0.5 flex items-center gap-1 justify-end">
                        <Timer size={10} />{pipeline.duration}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 justify-end">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center">
                          {pipeline.authorInitials}
                        </div>
                        <span className="text-xs text-muted-foreground">{pipeline.author}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stagesComplete}/{pipeline.stages.length} stages
                      </p>
                    </div>

                    <ChevronDown
                      size={14}
                      className={`flex-shrink-0 text-muted-foreground transition-transform mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {/* Expanded: Stage Logs */}
                  {isExpanded && (
                    <div className="border-t-2 border-border bg-muted/10 px-4 sm:px-5 py-4">
                      {/* Terminal Header */}
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <Terminal size={13} className="text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground">Stage Logs</span>
                        <span className="text-xs text-muted-foreground">
                          — {stagesComplete}/{pipeline.stages.length} stages complete
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          Triggered by <span className="font-semibold text-foreground">{pipeline.triggeredBy}</span>
                        </span>
                      </div>

                      {/* Stage Log Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {pipeline.stages.map(stage => (
                          <StageLogPanel key={stage.id} stage={stage} />
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all">
                          <Play size={11} /> Re-run Pipeline
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                          <RotateCcw size={11} /> Rollback
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                          <Eye size={11} /> View Artifacts
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pipeline Health Summary */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-border flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              <span className="text-sm font-bold text-foreground">Pipeline Health Summary</span>
            </div>
            <div className="px-4 sm:px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Success Rate (7d)', value: `${successRate}%`, trend: '+2%', up: true },
                { label: 'Avg Build Time', value: avgDuration, trend: '-18s', up: true },
                { label: 'Deploy Frequency', value: '3.2/day', trend: '+0.4', up: true },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-black text-foreground tabular-nums">{m.value}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${m.up ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {m.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {m.trend}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Performance Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Build Duration Trend */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Build Duration Trend</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Avg build time (min) · 7-day window</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0">
                  <TrendingDown size={11} />↓ 1.1m faster
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={buildDurationData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="durGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="p95Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} unit="m" domain={[4, 11]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}m`, '']} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="duration" name="Avg Duration" stroke="#6366F1" strokeWidth={2} fill="url(#durGrad)" dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="p95" name="P95 Duration" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#p95Grad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Avg Deployment Time — Weekly */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Avg Deployment Time</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Weekly average vs 7-minute target</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0">
                  <TrendingUp size={11} />Below target
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={avgDeployTimeData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} unit="m" domain={[5, 10]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}m`, '']} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="avgTime" name="Avg Deploy Time" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="target" name="Target (7m)" stroke="#10B981" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stage Success Rates */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">Stage Success Rates</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Pass rate per CI/CD stage across all runs (7d)</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <BarChart2 size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Overall: 95.2%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageSuccessData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} domain={[85, 100]} unit="%" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Success Rate']} />
                <Bar dataKey="rate" name="Success Rate" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {stageSuccessData.map((entry) => (
                    <Cell
                      key={`cell-${entry.stage}`}
                      fill={entry.rate >= 97 ? '#10B981' : entry.rate >= 93 ? '#6366F1' : '#F59E0B'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {[
                { label: '≥97% Excellent', color: 'bg-emerald-500' },
                { label: '93–96% Good', color: 'bg-indigo-500' },
                { label: '<93% Needs attention', color: 'bg-amber-500' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </AppLayout>
      <StickyShareWidget
        pageTitle="COIS Deployment Pipeline — CI/CD Monitor"
        githubUrl="https://github.com/lavishpandey67"
        linkedinUrl="https://linkedin.com/in/lavishpandey"
      />
    </>
  );
}