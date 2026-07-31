'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { GitBranch, GitCommit, GitMerge, GitPullRequest, Star, Code2, Server, Database, Rocket, Shield, CheckCircle2, ExternalLink, Layers, ArrowRight, Package, Zap, Activity, Clock, Users, FileText, BarChart2, ChevronDown, ChevronUp, Link2, RefreshCw, AlertCircle, GitFork,  } from 'lucide-react';
import StickyShareWidget from '@/components/StickyShareWidget';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GHRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  topics: string[];
  default_branch: string;
  updated_at: string;
  pushed_at: string;
  open_issues_count: number;
  size: number;
}

interface GHCommit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  html_url: string;
}

interface GHUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  location: string | null;
  company: string | null;
  blog: string | null;
}

interface GHContribDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface GHCache {
  timestamp: number;
  user: GHUser | null;
  repos: GHRepo[];
  commits: GHCommit[];
  contribDays: GHContribDay[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const GH_USER = 'lavishpandey67';
const GH_API = 'https://api.github.com';
const GH_CACHE_KEY = 'gh_portfolio_cache';
const GH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const LANG_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-blue-400',
  HCL: 'bg-violet-500',
  HTML: 'bg-orange-500',
  CSS: 'bg-pink-500',
  Shell: 'bg-emerald-500',
  Dockerfile: 'bg-sky-500',
};

const COMMIT_TYPE_CONFIG = {
  feat:     { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'feat' },
  fix:      { color: 'text-red-700',     bg: 'bg-red-100',     label: 'fix' },
  refactor: { color: 'text-blue-700',    bg: 'bg-blue-100',    label: 'refactor' },
  chore:    { color: 'text-slate-600',   bg: 'bg-slate-100',   label: 'chore' },
  perf:     { color: 'text-amber-700',   bg: 'bg-amber-100',   label: 'perf' },
  docs:     { color: 'text-violet-700',  bg: 'bg-violet-100',  label: 'docs' },
  test:     { color: 'text-cyan-700',    bg: 'bg-cyan-100',    label: 'test' },
  ci:       { color: 'text-orange-700',  bg: 'bg-orange-100',  label: 'ci' },
  other:    { color: 'text-slate-600',   bg: 'bg-slate-100',   label: 'commit' },
};

type CommitType = keyof typeof COMMIT_TYPE_CONFIG;

function detectCommitType(msg: string): CommitType {
  const lower = msg.toLowerCase();
  if (lower.startsWith('feat')) return 'feat';
  if (lower.startsWith('fix')) return 'fix';
  if (lower.startsWith('refactor')) return 'refactor';
  if (lower.startsWith('chore')) return 'chore';
  if (lower.startsWith('perf')) return 'perf';
  if (lower.startsWith('docs')) return 'docs';
  if (lower.startsWith('test')) return 'test';
  if (lower.startsWith('ci')) return 'ci';
  return 'other';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

function loadGHCache(): GHCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GH_CACHE_KEY);
    if (!raw) return null;
    const cache: GHCache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > GH_CACHE_TTL) return null;
    return cache;
  } catch {
    return null;
  }
}

function saveGHCache(data: Omit<GHCache, 'timestamp'>) {
  if (typeof window === 'undefined') return;
  try {
    const cache: GHCache = { ...data, timestamp: Date.now() };
    localStorage.setItem(GH_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage quota exceeded — ignore
  }
}

// ─── Contribution Graph ───────────────────────────────────────────────────────

function ContributionGraph({ weeks }: { weeks: GHContribDay[][] }) {
  const levels = ['bg-muted', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-700'];
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0.5 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day, di) => (
              <div
                key={di}
                className={`w-3 h-3 rounded-sm ${levels[day.level]} cursor-default`}
                title={day.count > 0 ? `${day.count} contribution${day.count > 1 ? 's' : ''} on ${day.date}` : `No contributions on ${day.date}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-xs text-muted-foreground">Less</span>
        {levels.map((l, i) => <div key={i} className={`w-3 h-3 rounded-sm ${l}`} />)}
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

// ─── Modules (static) ─────────────────────────────────────────────────────────

const MODULES = [
  { name: 'Executive Dashboard', icon: <BarChart2 size={14} />, href: '/', desc: 'KPI bento grid, risk alerts, AI insights' },
  { name: 'Customer Management', icon: <Users size={14} />, href: '/customer-management', desc: 'Health scores, stage tracking, drawer' },
  { name: 'Deployment Pipeline', icon: <Rocket size={14} />, href: '/deployment-pipeline', desc: 'CI/CD stages, terminal logs, status check' },
  { name: 'Infrastructure Status', icon: <Server size={14} />, href: '/infrastructure-status', desc: 'Multi-cloud health, latency, incidents' },
  { name: 'SLA Tracker', icon: <Clock size={14} />, href: '/sla-tracker', desc: 'Breach detection, P1/P2/P3 incidents' },
  { name: 'AI Assistant', icon: <Zap size={14} />, href: '/ai-assistant', desc: 'GPT-4 chat with session persistence' },
  { name: 'Audit Log', icon: <Shield size={14} />, href: '/audit-log', desc: 'DevOps events, deploy history, filters' },
  { name: 'Case Study', icon: <FileText size={14} />, href: '/case-study', desc: 'BA portfolio, KPI architecture, decisions' },
];

const TECH_STACK = [
  { name: 'Next.js 15', category: 'Frontend', color: 'text-foreground', bg: 'bg-muted border-border' },
  { name: 'TypeScript', category: 'Language', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  { name: 'Tailwind CSS', category: 'Styling', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
  { name: 'Supabase', category: 'Backend', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  { name: 'PostgreSQL', category: 'Database', color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' },
  { name: 'Docker', category: 'DevOps', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { name: 'GitHub Actions', category: 'CI/CD', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  { name: 'AWS / Azure', category: 'Cloud', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  { name: 'Recharts', category: 'Charts', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  { name: 'Lucide React', category: 'Icons', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
];

// ─── Build contribution grid from repos push dates ────────────────────────────

function buildContribGrid(repos: GHRepo[], commits: GHCommit[]): GHContribDay[][] {
  // Build a map of date → count from commit dates
  const countMap: Record<string, number> = {};
  commits.forEach(c => {
    let d = c.commit.author.date.slice(0, 10);
    countMap[d] = (countMap[d] || 0) + 1;
  });

  // Also add repo push dates as activity signals
  repos.forEach(r => {
    let d = r.pushed_at.slice(0, 10);
    countMap[d] = (countMap[d] || 0) + 1;
  });

  const today = new Date();
  const weeks: GHContribDay[][] = [];
  // Go back 26 weeks
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 26 * 7);
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  let cur = new Date(startDate);
  while (cur <= today) {
    const week: GHContribDay[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cur.toISOString().slice(0, 10);
      const count = countMap[dateStr] || 0;
      const level: 0 | 1 | 2 | 3 | 4 = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;
      week.push({ date: dateStr, count, level });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PortfolioShowcaseClient() {
  const [ghUser, setGhUser] = useState<GHUser | null>(null);
  const [repos, setRepos] = useState<GHRepo[]>([]);
  const [commits, setCommits] = useState<GHCommit[]>([]);
  const [contribWeeks, setContribWeeks] = useState<GHContribDay[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllCommits, setShowAllCommits] = useState(false);
  const [lastFetched, setLastFetched] = useState<string>('');

  const fetchGitHub = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = { Accept: 'application/vnd.github+json' };

      // Fetch user profile
      const userRes = await fetch(`${GH_API}/users/${GH_USER}`, { headers });
      if (!userRes.ok) throw new Error(`GitHub API error: ${userRes.status}`);
      const userData: GHUser = await userRes.json();
      setGhUser(userData);

      // Fetch repos (sorted by pushed)
      const reposRes = await fetch(
        `${GH_API}/users/${GH_USER}/repos?sort=pushed&per_page=6&type=public`,
        { headers }
      );
      const reposData: GHRepo[] = reposRes.ok ? await reposRes.json() : [];
      setRepos(reposData);

      // Fetch recent commits from top repos
      const allCommits: GHCommit[] = [];
      const topRepos = reposData.slice(0, 3);
      await Promise.all(
        topRepos.map(async repo => {
          try {
            const cRes = await fetch(
              `${GH_API}/repos/${GH_USER}/${repo.name}/commits?per_page=10`,
              { headers }
            );
            if (cRes.ok) {
              const cData: GHCommit[] = await cRes.json();
              allCommits.push(...cData);
            }
          } catch {
            // ignore per-repo errors
          }
        })
      );

      // Sort commits by date desc
      allCommits.sort(
        (a, b) =>
          new Date(b.commit.author.date).getTime() -
          new Date(a.commit.author.date).getTime()
      );
      setCommits(allCommits.slice(0, 20));

      // Build contribution grid
      setContribWeeks(buildContribGrid(reposData, allCommits));

      // Save to localStorage cache
      saveGHCache({ user: userData, repos: reposData, commits: allCommits.slice(0, 20), contribDays: [] });

      setLastFetched(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cache = loadGHCache();
    if (cache) {
      setGhUser(cache.user);
      setRepos(cache.repos);
      setCommits(cache.commits);
      setContribWeeks(buildContribGrid(cache.repos, cache.commits));
      setLoading(false);
      setLastFetched(new Date().toLocaleTimeString());
    } else {
      fetchGitHub();
    }
  }, []);

  const visibleCommits = showAllCommits ? commits : commits.slice(0, 6);
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

  return (
    <>
    <AppLayout title="Portfolio Showcase" subtitle="GitHub · Real Repos · Commits · Contribution Activity">
      <div className="space-y-6">

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span className="flex-1">{error} — showing cached data where available.</span>
            <button onClick={fetchGitHub} className="flex items-center gap-1.5 text-xs font-bold hover:underline">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Hero Profile Card */}
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-slate-800 via-violet-900 to-slate-900 relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }} />
          </div>
          <div className="px-5 sm:px-6 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-8">
              <div className="flex items-end gap-4">
                {loading ? (
                  <Skeleton className="w-16 h-16 rounded-full border-4 border-card" />
                ) : ghUser?.avatar_url ? (
                  <img
                    src={ghUser.avatar_url}
                    alt={`${ghUser.name || GH_USER} GitHub avatar`}
                    className="w-16 h-16 rounded-full border-4 border-card object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 border-4 border-card flex items-center justify-center text-white text-xl font-black flex-shrink-0">
                    LP
                  </div>
                )}
                <div className="pb-1">
                  {loading ? (
                    <>
                      <Skeleton className="h-5 w-36 mb-1" />
                      <Skeleton className="h-3.5 w-52" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-lg font-black text-foreground">{ghUser?.name || 'Lavish Pandey'}</h1>
                      <p className="text-sm text-muted-foreground">
                        {ghUser?.bio || 'Business Analyst · Full-Stack Engineer · DevOps Enthusiast'}
                      </p>
                      {ghUser?.location && (
                        <p className="text-xs text-muted-foreground mt-0.5">{ghUser.location}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pb-1">
                <a
                  href={ghUser?.html_url || `https://github.com/${GH_USER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-foreground text-background rounded-lg hover:opacity-80 transition-all"
                >
                  <Link2 size={13} /> GitHub Profile
                </a>
                <Link
                  href="/case-study"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <FileText size={13} /> Case Study
                </Link>
                <button
                  onClick={fetchGitHub}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-50"
                  title="Refresh GitHub data"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  {lastFetched ? `Updated ${lastFetched}` : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)
              ) : (
                [
                  { label: 'Public Repos', value: String(ghUser?.public_repos ?? repos.length), icon: <Code2 size={14} className="text-muted-foreground" /> },
                  { label: 'Total Stars', value: String(totalStars), icon: <Star size={14} className="text-amber-500" /> },
                  { label: 'Total Forks', value: String(totalForks), icon: <GitFork size={14} className="text-blue-500" /> },
                  { label: 'Followers', value: String(ghUser?.followers ?? 0), icon: <Users size={14} className="text-violet-500" /> },
                ].map(s => (
                  <div key={s.label} className="bg-muted/40 rounded-xl p-3 flex items-center gap-2.5">
                    {s.icon}
                    <div>
                      <p className="text-base font-black text-foreground tabular-nums">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Contribution Graph */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-border flex items-center gap-2">
            <Activity size={14} className="text-primary" />
            <span className="text-sm font-bold text-foreground">Contribution Activity</span>
            <span className="text-xs text-muted-foreground ml-auto">Last 6 months · GitHub</span>
          </div>
          <div className="px-4 sm:px-5 py-4">
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : contribWeeks.length > 0 ? (
              <ContributionGraph weeks={contribWeeks} />
            ) : (
              <p className="text-xs text-muted-foreground">No contribution data available</p>
            )}
          </div>
        </div>

        {/* Repositories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">Repositories</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{loading ? '…' : repos.length}</span>
            <span className="text-xs text-muted-foreground ml-auto">github.com/{GH_USER}</span>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
            </div>
          ) : repos.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
              No public repositories found for {GH_USER}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {repos.map(repo => (
                <div key={repo.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all group flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Code2 size={14} className="text-primary flex-shrink-0" />
                      <span className="text-sm font-bold text-primary truncate group-hover:underline">{repo.name}</span>
                    </div>
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                      <ExternalLink size={13} />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">
                    {repo.description || 'No description provided.'}
                  </p>
                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {repo.topics.slice(0, 5).map(t => (
                        <span key={t} className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${LANG_COLORS[repo.language] || 'bg-slate-400'}`} />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Star size={11} />{repo.stargazers_count}</span>
                    <span className="flex items-center gap-1"><GitFork size={11} />{repo.forks_count}</span>
                    <span className="flex items-center gap-1 ml-auto"><GitBranch size={11} />{repo.default_branch}</span>
                    <span className="font-mono">{timeAgo(repo.pushed_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Commits + Tech Stack */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Recent Commits */}
          <div className="xl:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-border flex items-center gap-2">
              <GitCommit size={14} className="text-primary" />
              <span className="text-sm font-bold text-foreground">Recent Commits</span>
              <span className="text-xs text-muted-foreground ml-auto font-mono">
                {loading ? '…' : `${commits.length} commits fetched`}
              </span>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : commits.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No commits found</div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {visibleCommits.map(commit => {
                    const type = detectCommitType(commit.commit.message);
                    const typeCfg = COMMIT_TYPE_CONFIG[type];
                    const cleanMsg = commit.commit.message.split('\n')[0].replace(/^(feat|fix|refactor|chore|perf|docs|test|ci)(\(.+?\))?:\s*/i, '');
                    return (
                      <div key={commit.sha} className="flex items-start gap-3 px-4 sm:px-5 py-3 hover:bg-muted/20 transition-colors">
                        <div className="flex-shrink-0 mt-0.5">
                          <GitCommit size={13} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${typeCfg.bg} ${typeCfg.color}`}>{typeCfg.label}</span>
                            <span className="text-xs font-medium text-foreground truncate">{cleanMsg}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <a
                              href={commit.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground font-mono hover:text-primary transition-colors"
                            >
                              {commit.sha.slice(0, 7)}
                            </a>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{commit.commit.author.name}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(commit.commit.author.date)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {commits.length > 6 && (
                  <div className="px-4 sm:px-5 py-3 border-t border-border">
                    <button
                      onClick={() => setShowAllCommits(v => !v)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showAllCommits
                        ? <><ChevronUp size={12} /> Show less</>
                        : <><ChevronDown size={12} /> Show {commits.length - 6} more commits</>}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tech Stack */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-border flex items-center gap-2">
              <Layers size={14} className="text-primary" />
              <span className="text-sm font-bold text-foreground">Tech Stack</span>
            </div>
            <div className="px-4 sm:px-5 py-4 space-y-2">
              {TECH_STACK.map(tech => (
                <div key={tech.name} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${tech.bg}`}>
                  <span className={`text-xs font-bold ${tech.color}`}>{tech.name}</span>
                  <span className="text-xs text-muted-foreground">{tech.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modules Built */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-border flex items-center gap-2">
            <Package size={14} className="text-primary" />
            <span className="text-sm font-bold text-foreground">Modules Built</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-auto">{MODULES.length} modules</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {MODULES.map((mod, i) => (
              <Link
                key={mod.name}
                href={mod.href}
                className={`flex items-start gap-3 px-4 sm:px-5 py-4 hover:bg-muted/30 transition-colors group ${
                  i > 0 && i % 2 === 0 ? 'sm:border-t border-border' : ''
                } ${i > 0 && i % 4 === 0 ? 'xl:border-t border-border' : ''}`}
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                  {mod.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">{mod.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{mod.desc}</p>
                </div>
                <ArrowRight size={12} className="text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Git Workflow */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-border flex items-center gap-2">
            <GitMerge size={14} className="text-primary" />
            <span className="text-sm font-bold text-foreground">Git Workflow</span>
          </div>
          <div className="px-4 sm:px-5 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  phase: '1. Feature Branch',
                  icon: <GitBranch size={16} className="text-blue-600" />,
                  color: 'border-blue-200 bg-blue-50/50',
                  steps: ['git checkout -b feature/name', 'Implement feature', 'Write unit tests', 'git push origin feature/name'],
                },
                {
                  phase: '2. Pull Request',
                  icon: <GitPullRequest size={16} className="text-violet-600" />,
                  color: 'border-violet-200 bg-violet-50/50',
                  steps: ['Open PR → main', 'CI runs automatically', 'Code review', 'Merge on approval'],
                },
                {
                  phase: '3. CI/CD Pipeline',
                  icon: <Rocket size={16} className="text-emerald-600" />,
                  color: 'border-emerald-200 bg-emerald-50/50',
                  steps: ['Lint + Type Check', 'Unit Tests (84%+ coverage)', 'Docker Build', 'Deploy → Staging'],
                },
                {
                  phase: '4. Production Deploy',
                  icon: <CheckCircle2 size={16} className="text-emerald-600" />,
                  color: 'border-emerald-200 bg-emerald-50/50',
                  steps: ['Smoke Tests pass', 'Deploy → Production', 'CDN cache purge', 'Rollback checkpoint saved'],
                },
              ].map(phase => (
                <div key={phase.phase} className={`rounded-xl border-2 p-4 ${phase.color}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {phase.icon}
                    <span className="text-xs font-bold text-foreground">{phase.phase}</span>
                  </div>
                  <div className="space-y-1.5">
                    {phase.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground mt-0.5 flex-shrink-0">→</span>
                        <span className="text-xs text-foreground font-mono leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'View Case Study', desc: 'Full BA portfolio breakdown — KPI architecture, design decisions, outcomes', href: '/case-study', icon: <FileText size={16} />, primary: true },
            { label: 'Deployment Pipeline', desc: 'Live CI/CD monitor with stage logs, status check, and rollback controls', href: '/deployment-pipeline', icon: <Rocket size={16} />, primary: false },
            { label: 'Infrastructure Status', desc: 'Multi-cloud health dashboard — AWS, Azure, real-time metrics', href: '/infrastructure-status', icon: <Server size={16} />, primary: false },
          ].map(cta => (
            <Link
              key={cta.label}
              href={cta.href}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all group ${
                cta.primary
                  ? 'bg-primary text-primary-foreground border-primary hover:opacity-90'
                  : 'bg-card border-border hover:border-primary/40 hover:bg-muted/30'
              }`}
            >
              <div className={`flex-shrink-0 mt-0.5 ${cta.primary ? 'text-primary-foreground' : 'text-primary'}`}>{cta.icon}</div>
              <div className="min-w-0">
                <p className={`text-sm font-bold ${cta.primary ? 'text-primary-foreground' : 'text-foreground'}`}>{cta.label}</p>
                <p className={`text-xs mt-0.5 leading-relaxed ${cta.primary ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{cta.desc}</p>
              </div>
              <ArrowRight size={14} className={`flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 ${cta.primary ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            </Link>
          ))}
        </div>

      </div>
    </AppLayout>
    <StickyShareWidget
      pageTitle="Portfolio Showcase — Lavish Pandey · B2B SaaS Engineering"
      githubUrl="https://github.com/lavishpandey67"
      linkedinUrl="https://linkedin.com/in/lavishpandey"
    />
    </>
  );
}
