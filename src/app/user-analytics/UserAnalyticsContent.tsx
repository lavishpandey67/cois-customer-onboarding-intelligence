'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, FunnelChart, Funnel, LabelList, Cell,
} from 'recharts';
import {
  Users, Eye, MousePointerClick, TrendingUp, TrendingDown,
  Activity, GitBranch, Github, BookOpen, Rocket, RefreshCw,
  ArrowRight, Zap, Clock, BarChart2,
} from 'lucide-react';

// ─── GA Event Tracker ────────────────────────────────────────────────────────
function trackGAEvent(eventName: string, params: Record<string, string | number>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
}

// ─── Mock GA Data ─────────────────────────────────────────────────────────────
const sessionsTrendData = [
  { day: 'Mon', sessions: 1240, users: 890, pageViews: 3420 },
  { day: 'Tue', sessions: 1580, users: 1120, pageViews: 4210 },
  { day: 'Wed', sessions: 1390, users: 980, pageViews: 3890 },
  { day: 'Thu', sessions: 1720, users: 1240, pageViews: 4680 },
  { day: 'Fri', sessions: 2010, users: 1450, pageViews: 5320 },
  { day: 'Sat', sessions: 1340, users: 960, pageViews: 3140 },
  { day: 'Sun', sessions: 980,  users: 720, pageViews: 2560 },
];

const pageViewsData = [
  { page: '/dashboard',            views: 3420, avgTime: '3m 12s', bounceRate: 18 },
  { page: '/portfolio-showcase',   views: 2890, avgTime: '4m 48s', bounceRate: 12 },
  { page: '/deployment-pipeline',  views: 2140, avgTime: '5m 22s', bounceRate: 9 },
  { page: '/case-study',           views: 1980, avgTime: '6m 04s', bounceRate: 14 },
  { page: '/infrastructure-status',views: 1560, avgTime: '4m 11s', bounceRate: 21 },
  { page: '/analytics',            views: 1240, avgTime: '3m 38s', bounceRate: 24 },
  { page: '/sla-tracker',          views: 980,  avgTime: '2m 55s', bounceRate: 28 },
];

const userFlowData = [
  { name: 'Landing / Dashboard', value: 5240, fill: '#6366F1' },
  { name: 'Portfolio Showcase',  value: 3890, fill: '#8B5CF6' },
  { name: 'Case Study',          value: 2640, fill: '#0EA5E9' },
  { name: 'Deployment Pipeline', value: 1820, fill: '#10B981' },
  { name: 'Deploy Button Click', value: 980,  fill: '#F59E0B' },
];

const goalEventsData = [
  { day: 'Mon', repoClick: 42, githubView: 38, caseStudyScroll: 67, deployClick: 28 },
  { day: 'Tue', repoClick: 58, githubView: 51, caseStudyScroll: 89, deployClick: 34 },
  { day: 'Wed', repoClick: 49, githubView: 44, caseStudyScroll: 72, deployClick: 29 },
  { day: 'Thu', repoClick: 71, githubView: 63, caseStudyScroll: 104, deployClick: 47 },
  { day: 'Fri', repoClick: 88, githubView: 79, caseStudyScroll: 128, deployClick: 62 },
  { day: 'Sat', repoClick: 54, githubView: 48, caseStudyScroll: 81, deployClick: 38 },
  { day: 'Sun', repoClick: 31, githubView: 27, caseStudyScroll: 52, deployClick: 19 },
];

const deviceData = [
  { device: 'Desktop', sessions: 3240, pct: 52 },
  { device: 'Mobile',  sessions: 2180, pct: 35 },
  { device: 'Tablet',  sessions: 820,  pct: 13 },
];

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--foreground)',
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string; value: string; sub: string; trend: string;
  up: boolean; icon: React.ReactNode; color: string; bg: string;
}
function KpiCard({ label, value, sub, trend, up, icon, color, bg }: KpiCardProps) {
  return (
    <div className={`${bg} rounded-xl p-4 border flex items-start gap-3`}>
      <div className={`flex-shrink-0 mt-0.5 ${color}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-end gap-2 flex-wrap">
          <p className={`text-2xl font-black tabular-nums leading-none ${color}`}>{value}</p>
          <span className={`flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md mb-0.5 ${up ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend}
          </span>
        </div>
        <p className="text-xs font-semibold text-foreground mt-1">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

// ─── Goal Event Button ────────────────────────────────────────────────────────
interface GoalButtonProps {
  label: string; eventName: string; params: Record<string, string | number>;
  icon: React.ReactNode; color: string; count: number;
}
function GoalEventButton({ label, eventName, params, icon, color, count }: GoalButtonProps) {
  const [fired, setFired] = useState(false);
  const [localCount, setLocalCount] = useState(count);
  const handleClick = useCallback(() => {
    trackGAEvent(eventName, params);
    setFired(true);
    setLocalCount(c => c + 1);
    setTimeout(() => setFired(false), 2000);
  }, [eventName, params]);
  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all w-full text-left ${fired ? 'bg-emerald-50 border-emerald-300' : 'bg-card border-border hover:bg-muted'}`}
    >
      <div className={`flex-shrink-0 ${color}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground truncate">{label}</p>
        <p className="text-xs text-muted-foreground">{localCount} events today</p>
      </div>
      {fired ? <span className="text-xs font-bold text-emerald-600 flex-shrink-0">✓ Fired</span> : <span className="text-xs text-muted-foreground flex-shrink-0">Simulate</span>}
    </button>
  );
}

// ─── Active Users Pulse ───────────────────────────────────────────────────────
function ActiveUsersPulse() {
  const [count, setCount] = useState(47);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => Math.max(30, Math.min(80, c + Math.floor(Math.random() * 7) - 3)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
      <span className="text-2xl font-black text-emerald-700 tabular-nums">{count}</span>
      <span className="text-xs text-muted-foreground">right now</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserAnalyticsContent() {
  const [lastRefresh, setLastRefresh] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'flow'>('overview');

  useEffect(() => {
    const now = new Date();
    setLastRefresh(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  }, []);

  const handleRefresh = useCallback(() => {
    const now = new Date();
    setLastRefresh(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    trackGAEvent('analytics_refresh', { page: 'user_analytics' });
  }, []);

  return (
    <AppLayout title="User Analytics" subtitle="Google Analytics · Real-time engagement · Portfolio conversion tracking">
      <div className="space-y-5">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <Activity size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">Live · GA4</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            {lastRefresh && <span className="text-xs text-muted-foreground">Updated {lastRefresh}</span>}
          </div>
          <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl bg-card hover:bg-muted transition-all">
            <RefreshCw size={12} />Refresh
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard label="Sessions (7d)" value="10,260" sub="vs 9,140 last week" trend="+12.3%" up icon={<BarChart2 size={16} />} color="text-blue-700" bg="bg-blue-50 border-blue-200" />
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 text-emerald-600"><Users size={16} /></div>
            <div>
              <p className="text-xs font-semibold text-foreground">Active Users</p>
              <ActiveUsersPulse />
              <p className="text-xs text-muted-foreground">6,380 unique (7d)</p>
            </div>
          </div>
          <KpiCard label="Page Views (7d)" value="27,220" sub="4.2 pages/session avg" trend="+8.7%" up icon={<Eye size={16} />} color="text-violet-700" bg="bg-violet-50 border-violet-200" />
          <KpiCard label="Bounce Rate" value="19.4%" sub="vs 23.1% last week" trend="-3.7%" up icon={<MousePointerClick size={16} />} color="text-amber-700" bg="bg-amber-50 border-amber-200" />
        </div>

        {/* Tab Nav */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1 w-fit overflow-x-auto">
          {(['overview', 'goals', 'flow'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab === 'overview' ? 'Sessions Overview' : tab === 'goals' ? 'Goal Events' : 'User Flow'}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-foreground">Sessions & Users — 7-Day Trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Daily sessions, unique users, and page views</p>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={sessionsTrendData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#6366F1" strokeWidth={2} fill="url(#sessGrad)" dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="users" name="Users" stroke="#10B981" strokeWidth={2} fill="url(#usersGrad)" dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-foreground">Top Pages by Views</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Avg session time and bounce rate per page</p>
                </div>
                <div className="space-y-2.5">
                  {pageViewsData.map((p, i) => (
                    <div key={p.page} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-foreground truncate">{p.page}</span>
                          <span className="text-xs font-bold text-foreground tabular-nums ml-2 flex-shrink-0">{p.views.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(p.views / pageViewsData[0].views) * 100}%` }} />
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={9} />{p.avgTime}</span>
                          <span className="text-xs text-muted-foreground">Bounce: {p.bounceRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-foreground">Sessions by Device</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Desktop, mobile, and tablet breakdown</p>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={deviceData} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="device" type="category" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={56} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="sessions" name="Sessions" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      <Cell fill="#6366F1" /><Cell fill="#8B5CF6" /><Cell fill="#0EA5E9" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {deviceData.map(d => (
                    <div key={d.device} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{d.device}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${d.pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-foreground w-8 text-right">{d.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Goal Events Tab ── */}
        {activeTab === 'goals' && (
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-foreground">Portfolio-to-Action Goal Events</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Click to fire GA4 goal events for key user journeys</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <GoalEventButton label="Portfolio Repo Click" eventName="portfolio_repo_click" params={{ event_category: 'portfolio', event_label: 'repo_link', value: 1 }} icon={<GitBranch size={16} />} color="text-blue-600" count={88} />
                <GoalEventButton label="GitHub Profile View" eventName="github_profile_view" params={{ event_category: 'portfolio', event_label: 'github_profile', value: 1 }} icon={<Github size={16} />} color="text-slate-700" count={79} />
                <GoalEventButton label="Case Study Section Scroll" eventName="case_study_scroll" params={{ event_category: 'engagement', event_label: 'case_study_section', value: 1 }} icon={<BookOpen size={16} />} color="text-violet-600" count={128} />
                <GoalEventButton label="Deploy Button Interaction" eventName="deploy_button_click" params={{ event_category: 'devops', event_label: 'deploy_button', value: 1 }} icon={<Rocket size={16} />} color="text-emerald-600" count={62} />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-foreground">Goal Events — 7-Day Trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Daily goal event completions by journey type</p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={goalEventsData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="repoClick" name="Repo Click" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="githubView" name="GitHub View" stroke="#64748B" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="caseStudyScroll" name="Case Study Scroll" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="deployClick" name="Deploy Click" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Repo Click Rate', value: '8.6%', sub: '88 / 1,024 sessions', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
                { label: 'GitHub View Rate', value: '7.7%', sub: '79 / 1,024 sessions', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
                { label: 'Case Study Depth', value: '12.5%', sub: '128 / 1,024 sessions', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
                { label: 'Deploy Interaction', value: '6.1%', sub: '62 / 1,024 sessions', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
              ].map(m => (
                <div key={m.label} className={`${m.bg} rounded-xl p-4 border`}>
                  <p className={`text-xl font-black tabular-nums ${m.color}`}>{m.value}</p>
                  <p className="text-xs font-semibold text-foreground mt-1">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── User Flow Tab ── */}
        {activeTab === 'flow' && (
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-foreground">Portfolio Conversion Funnel</h3>
                <p className="text-xs text-muted-foreground mt-0.5">User journey from landing to deploy button interaction</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <FunnelChart>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Funnel dataKey="value" data={userFlowData} isAnimationActive>
                    <LabelList position="right" fill="var(--foreground)" stroke="none" dataKey="name" style={{ fontSize: 11 }} />
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="value" style={{ fontSize: 12, fontWeight: 700 }} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-foreground">Step-by-Step Drop-off Analysis</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Conversion rate between each funnel stage</p>
              </div>
              <div className="space-y-3">
                {userFlowData.map((step, i) => {
                  const prev = i === 0 ? step.value : userFlowData[i - 1].value;
                  const dropPct = i === 0 ? 100 : Math.round((step.value / prev) * 100);
                  const barPct = Math.round((step.value / userFlowData[0].value) * 100);
                  return (
                    <div key={step.name}>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-xs font-bold text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
                        <span className="text-xs font-semibold text-foreground flex-1">{step.name}</span>
                        <span className="text-xs font-bold text-foreground tabular-nums">{step.value.toLocaleString()}</span>
                        {i > 0 && (
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${dropPct >= 70 ? 'bg-emerald-100 text-emerald-700' : dropPct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {dropPct}% retained
                          </span>
                        )}
                        {i === 0 && <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 flex-shrink-0">Entry</span>}
                      </div>
                      <div className="flex items-center gap-2 pl-7">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full transition-all" style={{ width: `${barPct}%`, backgroundColor: step.fill }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{barPct}%</span>
                      </div>
                      {i < userFlowData.length - 1 && (
                        <div className="flex items-center gap-1 pl-7 mt-1.5">
                          <ArrowRight size={10} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {(userFlowData[i + 1].value / step.value * 100).toFixed(1)}% continue to next step
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Avg Session Duration', value: '4m 22s', icon: <Clock size={16} />, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
                { label: 'Pages per Session', value: '4.2', icon: <Eye size={16} />, color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
                { label: 'Portfolio Conversion', value: '6.1%', icon: <Zap size={16} />, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
              ].map(m => (
                <div key={m.label} className={`${m.bg} rounded-xl p-4 border flex items-center gap-3`}>
                  <div className={`flex-shrink-0 ${m.color}`}>{m.icon}</div>
                  <div>
                    <p className={`text-2xl font-black tabular-nums ${m.color}`}>{m.value}</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
