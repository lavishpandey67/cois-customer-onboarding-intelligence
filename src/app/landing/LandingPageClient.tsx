'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { GitBranch, Star, Code2, Server, Database, Rocket, Shield, CheckCircle2, ExternalLink, Activity, Clock, Users, BarChart2, ArrowRight, Layers, Brain, ChevronRight, Play } from 'lucide-react';

// Inline SVG icons to avoid lucide-react barrel optimization issues
function Github({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function Linkedin({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// ─── Live KPI Counter ─────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(ease * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

// ─── Deployment Status Badge ──────────────────────────────────────────────────
function DeploymentBadge() {
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
      <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${pulse ? 'animate-pulse' : ''}`} />
      <span>Production · v2.4.1 · Deployed 3m ago</span>
      <CheckCircle2 size={11} />
    </div>
  );
}

// ─── Animated Terminal ────────────────────────────────────────────────────────
const TERMINAL_LINES = [
  { text: '$ git push origin main', color: 'text-slate-400', delay: 0 },
  { text: '✓ Source Checkout      0.8s', color: 'text-emerald-400', delay: 600 },
  { text: '✓ Install Dependencies 12.3s', color: 'text-emerald-400', delay: 1100 },
  { text: '✓ Lint & Type Check    4.1s', color: 'text-emerald-400', delay: 1600 },
  { text: '✓ Unit Tests (94/94)   8.7s', color: 'text-emerald-400', delay: 2100 },
  { text: '✓ Build                22.4s', color: 'text-emerald-400', delay: 2600 },
  { text: '✓ Security Scan        6.2s', color: 'text-emerald-400', delay: 3100 },
  { text: '✓ Docker Build         18.9s', color: 'text-emerald-400', delay: 3600 },
  { text: '→ Deploy Production…', color: 'text-blue-400', delay: 4100 },
  { text: '✓ Deployed to AWS us-east-1', color: 'text-emerald-400', delay: 4800 },
  { text: '✓ Smoke Tests passed', color: 'text-emerald-400', delay: 5200 },
  { text: '🚀 Pipeline complete in 73.4s', color: 'text-yellow-400', delay: 5700 },
];

function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers = TERMINAL_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    );
    const reset = setTimeout(() => setVisibleLines(0), 8000);
    return () => { timers.forEach(clearTimeout); clearTimeout(reset); };
  }, []);

  useEffect(() => {
    if (visibleLines === 0) {
      const t = setTimeout(() => setVisibleLines(1), 300);
      return () => clearTimeout(t);
    }
  }, [visibleLines]);

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl font-mono text-xs">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <span className="ml-3 text-slate-500 text-xs">cois-platform — CI/CD Pipeline</span>
      </div>
      <div className="p-4 space-y-1 min-h-[220px]">
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className={`${line.color} leading-relaxed`}>
            {line.text}
            {i === visibleLines - 1 && visibleLines < TERMINAL_LINES.length && (
              <span className="inline-block w-1.5 h-3.5 bg-current ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KPICardProps {
  label: string; target: number; suffix: string; prefix?: string;
  sub: string; icon: React.ReactNode; color: string;
}
function KPICard({ label, target, suffix, prefix = '', sub, icon, color }: KPICardProps) {
  const { value, ref } = useCounter(target);
  return (
    <div ref={ref} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-3 hover:border-slate-700 transition-colors">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white tabular-nums">{prefix}{value.toLocaleString()}{suffix}</p>
        <p className="text-xs font-semibold text-slate-300 mt-0.5">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Feature Bento ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <Activity size={20} />, title: 'Real-Time Onboarding Intelligence', desc: 'Live health scores, SLA countdowns, and risk flags across 50 active customer onboardings — updated every 30 seconds.', span: 'md:col-span-2', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: <Rocket size={20} />, title: 'CI/CD Pipeline Monitor', desc: '10-stage pipeline with live terminal logs, Docker build tracking, and one-click rollback.', span: '', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { icon: <Server size={20} />, title: 'Infrastructure Health', desc: 'CPU/memory jitter, uptime sparklines, and P1/P2/P3 incident management across AWS + Azure.', span: '', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: <Brain size={20} />, title: 'AI-Powered Insights', desc: 'GPT-4o assistant trained on your onboarding data — surfaces blockers, predicts churn risk, and drafts action plans.', span: '', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { icon: <Shield size={20} />, title: 'SLA Tracker + Incident Management', desc: 'P1–P3 classification, MTTR tracking, assigned engineers, and expandable incident timelines.', span: 'md:col-span-2', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { icon: <BarChart2 size={20} />, title: 'Analytics & GA4 Events', desc: 'Session trends, user flow funnels, and goal event tracking for portfolio-to-action conversions.', span: '', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { icon: <Database size={20} />, title: 'Supabase Real-Time Backend', desc: 'Row-level security, real-time subscriptions, and role-based access control across 12 tables.', span: '', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { icon: <Code2 size={20} />, title: 'Portfolio Showcase', desc: 'Live GitHub API integration — real repos, commits, contribution graph, and tech stack visualization.', span: 'md:col-span-2', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
];

const STACK = [
  'Next.js 15', 'TypeScript', 'Supabase', 'Tailwind CSS', 'OpenAI GPT-4o',
  'Recharts', 'GitHub API', 'Google Analytics 4', 'Vercel', 'Docker',
  'AWS', 'Azure', 'PostgreSQL', 'React 19',
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPageClient() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 40 ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Layers size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">COIS</span>
            <span className="hidden sm:inline text-xs text-slate-500 ml-1">/ Customer Onboarding Intelligence</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/lavishpandey67/cois-customer-onboarding-intelligence" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <Github size={15} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition-colors">
              Open Dashboard <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[200px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          {/* Badges row */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <DeploymentBadge />
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono">
              <GitBranch size={11} />
              <span>main · 247 commits</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono">
              <Star size={11} className="text-yellow-400" />
              <span>Portfolio Project 2026</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-5">
              <span className="text-white">Customer Onboarding</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                Intelligence Platform
              </span>
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
              A full-stack B2B SaaS portfolio project — real-time onboarding health, CI/CD pipeline monitoring,
              AI-powered insights, and infrastructure observability. Built with Next.js 15, Supabase, and OpenAI.
            </p>
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
            <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-semibold text-sm hover:bg-slate-100 transition-all shadow-lg shadow-white/10">
              <Play size={14} />
              Explore Dashboard
            </Link>
            <a href="https://github.com/lavishpandey67/cois-customer-onboarding-intelligence" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-sm hover:bg-slate-800 transition-all">
              <Github size={14} />
              View on GitHub
            </a>
            <a href="https://linkedin.com/in/lavishpandey" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-semibold text-sm hover:bg-blue-600/30 transition-all">
              <Linkedin size={14} />
              Connect on LinkedIn
            </a>
          </div>

          {/* Hero visual */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-3">
              <AnimatedTerminal />
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              {[
                { label: 'Pipeline Runs', value: '1,247', sub: 'total CI/CD executions', icon: <Rocket size={16} />, color: 'text-violet-400 bg-violet-500/10' },
                { label: 'Success Rate', value: '97.3%', sub: 'last 30 days', icon: <CheckCircle2 size={16} />, color: 'text-emerald-400 bg-emerald-500/10' },
                { label: 'Avg Deploy Time', value: '73s', sub: 'production deploys', icon: <Clock size={16} />, color: 'text-blue-400 bg-blue-500/10' },
                { label: 'Active Customers', value: '50', sub: 'onboarding tracked', icon: <Users size={16} />, color: 'text-amber-400 bg-amber-500/10' },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>{stat.icon}</div>
                  <p className="text-xl font-bold text-white tabular-nums">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">{stat.label}</p>
                  <p className="text-xs text-slate-500">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Live KPI Metrics ── */}
      <section className="py-16 px-4 sm:px-6 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">Live Platform Metrics</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Numbers that tell the story</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard label="Customers Tracked" target={50} suffix="" sub="active onboardings" icon={<Users size={16} />} color="text-blue-400 bg-blue-500/10" />
            <KPICard label="SLA Compliance" target={94} suffix="%" sub="on-time delivery" icon={<Shield size={16} />} color="text-emerald-400 bg-emerald-500/10" />
            <KPICard label="Pipeline Runs" target={1247} suffix="" sub="total executions" icon={<Rocket size={16} />} color="text-violet-400 bg-violet-500/10" />
            <KPICard label="Avg Health Score" target={78} suffix="/100" sub="across all accounts" icon={<Activity size={16} />} color="text-amber-400 bg-amber-500/10" />
            <KPICard label="AI Queries" target={3840} suffix="" sub="assistant interactions" icon={<Brain size={16} />} color="text-pink-400 bg-pink-500/10" />
            <KPICard label="Uptime" target={99} suffix=".9%" sub="production SLA" icon={<CheckCircle2 size={16} />} color="text-cyan-400 bg-cyan-500/10" />
          </div>
        </div>
      </section>

      {/* ── Feature Bento Grid ── */}
      <section className="py-16 px-4 sm:px-6 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2">Platform Capabilities</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Everything a CS team needs</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">8 interconnected modules built as a cohesive platform — not a collection of dashboards.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className={`${f.span} bg-slate-900/60 border ${f.border} rounded-xl p-5 hover:bg-slate-900/80 transition-all`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${f.bg} ${f.color}`}>{f.icon}</div>
                <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-16 px-4 sm:px-6 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">Tech Stack</p>
            <h2 className="text-2xl font-bold text-white">Built with production-grade tools</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {STACK.map((tech) => (
              <span key={tech} className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono hover:border-slate-500 hover:text-white transition-colors">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── GitHub Repo Link + LinkedIn CTA ── */}
      <section className="py-20 px-4 sm:px-6 border-t border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GitHub card */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-7 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Github size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">lavishpandey67 / cois-customer-onboarding-intelligence</p>
                  <p className="text-xs text-slate-500">Public repository</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Full source code — Next.js 15, Supabase schema migrations, CI/CD pipeline configs, and all 20+ page components.</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />TypeScript</span>
                <span className="flex items-center gap-1"><Star size={11} />Portfolio</span>
                <span className="flex items-center gap-1"><GitBranch size={11} />main</span>
              </div>
              <a href="https://github.com/lavishpandey67/cois-customer-onboarding-intelligence" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-950 font-semibold text-sm hover:bg-slate-100 transition-all mt-auto">
                <Github size={14} />
                View Repository
                <ExternalLink size={12} />
              </a>
            </div>

            {/* LinkedIn CTA */}
            <div className="bg-gradient-to-br from-blue-950/60 to-slate-900/60 border border-blue-500/30 rounded-2xl p-7 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Linkedin size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Lavish Pandey</p>
                  <p className="text-xs text-slate-400">Business Analyst · Full-Stack Developer</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">Open to BA, Product, and Full-Stack roles. Let's connect — I'd love to discuss this project or explore opportunities.</p>
              <div className="flex flex-wrap gap-2">
                {['B2B SaaS', 'Next.js', 'Supabase', 'DevOps', 'Product Analytics'].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">{tag}</span>
                ))}
              </div>
              <a href="https://linkedin.com/in/lavishpandey" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all mt-auto">
                <Linkedin size={14} />
                Connect on LinkedIn
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 sm:px-6 border-t border-slate-800/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">Ready to explore?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">See the full dashboard experience</h2>
          <p className="text-slate-400 text-sm mb-8 max-w-xl mx-auto">50 simulated customer onboardings, live CI/CD pipeline, real GitHub data, and AI-powered insights — all in one platform.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-all shadow-xl shadow-white/10">
              <Play size={14} />
              Open Full Dashboard
              <ChevronRight size={14} />
            </Link>
            <Link href="/case-study" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-sm hover:bg-slate-800 transition-all">
              Read Case Study
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">COIS — Customer Onboarding Intelligence System · Portfolio Project by Lavish Pandey · 2026</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <Link href="/case-study" className="hover:text-slate-300 transition-colors">Case Study</Link>
            <Link href="/portfolio-showcase" className="hover:text-slate-300 transition-colors">Portfolio</Link>
            <Link href="/deployment-pipeline" className="hover:text-slate-300 transition-colors">Pipeline</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
