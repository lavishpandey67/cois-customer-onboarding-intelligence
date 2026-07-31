'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import StickyShareWidget from '@/components/StickyShareWidget';
import {
  Target, Layers, Database, Cpu, BarChart2, Shield, Zap, Users, TrendingUp,
  CheckCircle2, AlertTriangle, GitBranch, Clock, Mail, Brain, ChevronDown,
  ChevronUp, ExternalLink, Code2, Globe, Lock, Activity,
} from 'lucide-react';

interface SectionProps { id: string; title: string; subtitle?: string; children: React.ReactNode; }
function Section({ id, title, subtitle, children }: SectionProps) {
  return (
    <section id={id} className="mb-16">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        <div className="mt-3 h-px bg-border" />
      </div>
      {children}
    </section>
  );
}

interface MetricCardProps { label: string; value: string; sub: string; icon: React.ReactNode; color: string; }
function MetricCard({ label, value, sub, icon, color }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs font-semibold text-foreground mt-0.5">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

interface DecisionCardProps { question: string; answer: string; rationale: string; }
function DecisionCard({ question, answer, rationale }: DecisionCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-muted/40 transition-colors">
        <div className="flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Design Decision</p>
          <p className="text-sm font-semibold text-foreground">{question}</p>
        </div>
        <span className="text-muted-foreground mt-1 flex-shrink-0">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border">
          <div className="pt-4 space-y-3">
            <div><p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Decision</p><p className="text-sm text-foreground">{answer}</p></div>
            <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Rationale</p><p className="text-sm text-muted-foreground leading-relaxed">{rationale}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TechRowProps { category: string; tech: string; why: string; icon: React.ReactNode; }
function TechRow({ category, tech, why, icon }: TechRowProps) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{category}</span>
          <span className="text-sm font-bold text-foreground">{tech}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{why}</p>
      </div>
    </div>
  );
}

const kpiDefinitions = [
  { kpi: 'Time to Value (TTV)', definition: 'Days from contract sign to customer reaching their first defined success milestone', why: 'Primary predictor of 12-month retention. Customers reaching First Value in <45 days show 34% higher renewal rates.', source: 'CS Ops industry benchmark + internal milestone data', icon: <Clock size={16} /> },
  { kpi: 'Health Score (0–100)', definition: 'Composite score across task completion rate, milestone velocity, engagement frequency, and support ticket volume', why: 'Traffic lights force binary decisions. A continuous scale shows direction — a score dropping from 72 to 61 is a different conversation than one stable at 44.', source: 'Weighted formula: 40% milestone progress + 30% task completion + 20% engagement + 10% support load', icon: <Activity size={16} /> },
  { kpi: 'Activation Rate', definition: 'Percentage of customers who reached First Value milestone within the contracted onboarding window', why: 'Activation is the leading indicator of expansion revenue. Non-activated customers almost never expand.', source: 'Milestone stage data — "First Value Delivered" stage completion', icon: <CheckCircle2 size={16} /> },
  { kpi: 'Revenue at Risk', definition: 'ARR sum of customers with Health Score < 60 or TTV > 150% of target', why: 'Converts operational metrics into financial language. Executives respond to dollar figures, not health scores.', source: 'Customer ARR × risk flag from health score threshold', icon: <AlertTriangle size={16} /> },
  { kpi: 'SLA Breach Rate', definition: 'Percentage of active SLA policies with at least one breach in the current period', why: 'SLA breaches are contractual obligations. Tracking breach rate surfaces systemic capacity issues before they become churn events.', source: 'SLA policies table × breach log with resolution timestamps', icon: <Shield size={16} /> },
];

const designDecisions: DecisionCardProps[] = [
  { question: 'Why build a custom health score instead of using a third-party tool like Gainsight?', answer: 'Designed a weighted composite formula (milestone 40%, task 30%, engagement 20%, support 10%) stored in PostgreSQL and computed on read.', rationale: 'Gainsight costs $30K+/year and is a black box. A custom formula is auditable, adjustable, and demonstrates that I understand what drives customer health — not just that I can configure a SaaS tool.' },
  { question: 'Why 9 onboarding stages instead of a simpler 3-stage model?', answer: 'Mapped the full B2B SaaS onboarding lifecycle: Kickoff → Discovery → Technical Setup → Data Migration → Configuration → Training → UAT → Go Live → First Value.', rationale: "A 3-stage model loses the diagnostic signal. When a customer is stuck, you need to know if they're stuck in Technical Setup vs UAT — those require completely different interventions." },
  { question: 'Why role-based access with 6 roles instead of a simpler admin/user split?', answer: 'Defined: Admin, CEO, Operations Director, CS Manager, CS Specialist, Support Agent — each with scoped page access enforced at the middleware layer.', rationale: 'B2B SaaS platforms serve multiple stakeholders with conflicting information needs. A CEO should see revenue-at-risk, not individual task assignments.' },
  { question: 'Why build AI Insights as separate cards instead of inline alerts?', answer: 'Dedicated AI Insight cards with click-through review, confidence scores, and Mark-as-Reviewed accountability.', rationale: 'Inline alerts create alert fatigue. Dedicated cards with a review workflow create accountability and an audit trail showing that a human acted on the AI recommendation.' },
  { question: 'Why Supabase over Firebase or a custom Node.js backend?', answer: 'Supabase provides PostgreSQL (not NoSQL), row-level security, real-time subscriptions, and edge functions in a single managed service.', rationale: 'The data model for CS operations is inherently relational. PostgreSQL with RLS means security is enforced at the database layer, not just the application layer.' },
  { question: 'Why Next.js App Router over a separate frontend/backend architecture?', answer: 'Server Components for data-heavy pages, Client Components for interactive elements, API Routes for AI and email endpoints.', rationale: 'A separate Express backend adds deployment complexity without benefit at this scale. Next.js App Router gives SSR for performance while keeping AI API keys server-side.' },
];

const builtModules = [
  { name: 'Executive Dashboard', desc: '8 KPI cards, 12-week TTV trend chart, AI insights panel, real-time risk alerts, activity feed', icon: <BarChart2 size={15} /> },
  { name: 'Customer Management', desc: 'Health score grid, 9-stage pipeline, customer detail drawer with full profile and task history', icon: <Users size={15} /> },
  { name: 'Task Management', desc: 'Kanban board (Backlog / In Progress / Blocked / In Review), task detail modal, list view toggle', icon: <CheckCircle2 size={15} /> },
  { name: 'Milestones Tracker', desc: 'Stage-by-stage completion across all customers, milestone velocity metrics', icon: <GitBranch size={15} /> },
  { name: 'SLA & Incident Management', desc: 'Policy management, breach log, P1/P2/P3 incident tracker with MTTR, email breach alerts via Resend', icon: <Shield size={15} /> },
  { name: 'AI Assistant', desc: 'Live OpenAI GPT-4o-mini streaming, COIS system prompt, multi-turn context, Supabase chat history', icon: <Brain size={15} /> },
  { name: 'Analytics', desc: 'Stage distribution, health trend, churn risk, CAC vs revenue charts via Recharts', icon: <TrendingUp size={15} /> },
  { name: 'Reports', desc: 'Monthly summary, at-risk customer report, TTV analysis — PDF and CSV export', icon: <BarChart2 size={15} /> },
  { name: 'Audit Log + Demo Simulator', desc: 'Real-time INSERT subscription, DevOps event feed, live event simulator for demo mode', icon: <Shield size={15} /> },
  { name: 'Team Management', desc: 'User profiles, role assignment, invitation workflow with email via Resend edge function', icon: <Users size={15} /> },
  { name: 'Authentication & RBAC', desc: '6-role model, Supabase Auth, middleware route protection, auto-profile creation trigger', icon: <Lock size={15} /> },
  { name: 'Cloud Cost & Resource Widget', desc: 'Compute, storage, DB, CDN usage vs budget with cost forecasting and alerts', icon: <Cpu size={15} /> },
];

const tocItems = [
  { id: 'context', label: 'Business Context' },
  { id: 'problem', label: 'Problem Statement' },
  { id: 'approach', label: 'Approach & Methodology' },
  { id: 'kpis', label: 'KPI Architecture' },
  { id: 'decisions', label: 'Design Decisions' },
  { id: 'tech', label: 'Tech Stack' },
  { id: 'built', label: 'What Was Built' },
  { id: 'outcomes', label: 'Outcomes & Signals' },
  { id: 'next', label: "What\'s Next" },
];

export default function CaseStudyClient() {
  const [activeSection, setActiveSection] = useState('context');

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveSection(id); }
  };

  return (
    <>
      <AppLayout>
        <div className="flex gap-8 max-w-7xl mx-auto px-6 py-8">
          <aside className="hidden xl:block w-52 flex-shrink-0">
            <div className="sticky top-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">On This Page</p>
              <nav className="space-y-0.5">
                {tocItems.map((item) => (
                  <button key={item.id} onClick={() => scrollTo(item.id)} className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${activeSection === item.id ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-6 p-3 bg-muted/50 rounded-xl border border-border">
                <p className="text-xs font-semibold text-foreground mb-1">Built by</p>
                <p className="text-xs text-muted-foreground">Lavish Pandey</p>
                <p className="text-xs text-muted-foreground">Business Analyst · CS Ops</p>
                <a href="https://linkedin.com/in/lavish-pandey-2846273a4" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
                  LinkedIn <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">Case Study</span>
                <span className="text-xs text-muted-foreground">B2B SaaS · CS Operations · Full-Stack</span>
              </div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight leading-tight mb-4">COIS — Customer Onboarding<br />Intelligence System</h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">How I designed and built a production-grade CS operations platform from a blank canvas — covering the business problem, KPI architecture, technical decisions, and what I learned about building software that reflects real operational thinking.</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {['Next.js 15', 'TypeScript', 'Supabase', 'PostgreSQL', 'OpenAI', 'Resend', 'Recharts', 'Tailwind CSS'].map((tag) => (
                  <span key={tag} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full border border-border">{tag}</span>
                ))}
              </div>
            </div>

            <Section id="context" title="Business Context" subtitle="The industry problem this platform addresses">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-card border border-border rounded-xl p-5 col-span-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">B2B SaaS companies spend significant CAC acquiring enterprise customers — then lose a disproportionate share of that ARR during the onboarding phase. CS teams managing 30–80 simultaneous onboardings have no unified operational view: milestone data lives in spreadsheets, task assignments in Jira, health signals in CRM notes, and risk flags in Slack messages.</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">The result is reactive CS management — teams discover problems after they've already impacted the customer relationship, not before. This is the gap COIS was designed to close.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Activation Rate" value="74.2%" sub="37 of 50 customers reached First Value" icon={<CheckCircle2 size={16} />} color="bg-emerald-500/10 text-emerald-600" />
                <MetricCard label="Avg Time to Value" value="41 days" sub="vs 52-day target — 21% ahead" icon={<Clock size={16} />} color="bg-blue-500/10 text-blue-600" />
                <MetricCard label="Revenue at Risk" value="$632K" sub="From 9 at-risk onboardings" icon={<AlertTriangle size={16} />} color="bg-amber-500/10 text-amber-600" />
                <MetricCard label="Avg Health Score" value="68.4" sub="18 customers below 60 threshold" icon={<Activity size={16} />} color="bg-violet-500/10 text-violet-600" />
              </div>
            </Section>

            <Section id="problem" title="Problem Statement" subtitle="Precisely what I set out to solve">
              <div className="space-y-4">
                {[
                  { icon: <AlertTriangle size={16} className="text-red-500" />, bg: 'bg-red-500/10', title: 'No unified operational view', desc: 'CS teams track customer health across 4–6 disconnected tools. There is no single source of truth for milestone progress, task status, and risk signals simultaneously.' },
                  { icon: <Clock size={16} className="text-amber-500" />, bg: 'bg-amber-500/10', title: 'Reactive risk detection', desc: 'Risk signals (stalled milestones, overdue tasks, low engagement) are identified in weekly review meetings — 5–7 days after the signal first appeared.' },
                  { icon: <BarChart2 size={16} className="text-blue-500" />, bg: 'bg-blue-500/10', title: 'Metrics without meaning', desc: 'CS teams report on activity metrics (calls made, emails sent) rather than outcome metrics (TTV, activation rate, revenue at risk).' },
                  { icon: <Users size={16} className="text-violet-500" />, bg: 'bg-violet-500/10', title: 'No role-appropriate information architecture', desc: 'A CEO needs revenue-at-risk. A CS Specialist needs their task queue. Existing tools show everyone the same view, creating information overload at every level.' },
                ].map((item) => (
                  <div key={item.title} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>{item.icon}</div>
                      <div><p className="text-sm font-semibold text-foreground mb-1">{item.title}</p><p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="approach" title="Approach & Methodology" subtitle="How I structured the build from requirements to deployment">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { phase: 'Phase 1 — Discovery', duration: 'Week 1', items: ['Mapped the CS onboarding lifecycle end-to-end', 'Identified 5 core stakeholder personas', 'Defined KPI hierarchy (outcome → leading → lagging)', 'Designed the 9-stage milestone model'], color: 'border-blue-500/30 bg-blue-500/5' },
                    { phase: 'Phase 2 — Architecture', duration: 'Week 2', items: ['Designed PostgreSQL schema (12 tables, 4 migrations)', 'Defined RBAC model (6 roles, scoped access)', 'Mapped real-time data flows (Supabase subscriptions)', 'Planned email notification triggers'], color: 'border-violet-500/30 bg-violet-500/5' },
                    { phase: 'Phase 3 — Build', duration: 'Weeks 3–4', items: ['12 pages, 40+ components', 'Supabase Auth + RLS policies', 'OpenAI streaming AI Assistant', 'Resend edge function (4 email types)', 'PDF/CSV export, Google Analytics'], color: 'border-emerald-500/30 bg-emerald-500/5' },
                  ].map((p) => (
                    <div key={p.phase} className={`border rounded-xl p-5 ${p.color}`}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-foreground">{p.phase}</p>
                        <span className="text-xs text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full border border-border">{p.duration}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {p.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Methodology Principle</p>
                  <p className="text-sm text-foreground leading-relaxed">Every feature was evaluated against one question: <span className="font-semibold text-primary">does this help a CS team detect risk earlier or act faster?</span> Features that didn't pass this test were cut.</p>
                </div>
              </div>
            </Section>

            <Section id="kpis" title="KPI Architecture" subtitle="How each metric was defined, why it was chosen, and how it's computed">
              <div className="space-y-3">
                {kpiDefinitions.map((kpi) => (
                  <div key={kpi.kpi} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">{kpi.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground mb-1">{kpi.kpi}</p>
                        <p className="text-xs text-foreground mb-2 leading-relaxed">{kpi.definition}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Why This Metric</p><p className="text-xs text-muted-foreground leading-relaxed">{kpi.why}</p></div>
                          <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Data Source</p><p className="text-xs text-muted-foreground leading-relaxed">{kpi.source}</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="decisions" title="Design Decisions" subtitle="The reasoning behind the non-obvious choices">
              <div className="space-y-3">{designDecisions.map((d) => <DecisionCard key={d.question} {...d} />)}</div>
            </Section>

            <Section id="tech" title="Tech Stack" subtitle="What was used and why each choice was deliberate">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 pt-5 pb-2">
                  <TechRow category="Framework" tech="Next.js 15 (App Router)" why="Server Components for data-heavy pages, Client Components for interactive elements. API Routes keep AI keys server-side." icon={<Globe size={16} />} />
                  <TechRow category="Language" tech="TypeScript" why="Strict typing across all 40+ components prevents runtime errors. Interface definitions serve as living documentation." icon={<Code2 size={16} />} />
                  <TechRow category="Database" tech="Supabase (PostgreSQL)" why="Relational model required for CS data. Row-level security enforces RBAC at the database layer. Real-time subscriptions built in." icon={<Database size={16} />} />
                  <TechRow category="Auth" tech="Supabase Auth + Middleware" why="JWT-based sessions with server-side route protection. Auto-profile creation trigger on signup. 6-role RBAC enforced at both middleware and component level." icon={<Lock size={16} />} />
                  <TechRow category="AI" tech="OpenAI GPT-4o-mini (Streaming)" why="Streaming responses via SSE give immediate feedback. COIS-specific system prompt grounds responses in CS operations context." icon={<Brain size={16} />} />
                  <TechRow category="Email" tech="Resend (Edge Functions)" why="Supabase Edge Functions run close to the database — ideal for event-triggered emails. 4 email types with HTML templates." icon={<Mail size={16} />} />
                  <TechRow category="Charts" tech="Recharts" why="Composable React components. Responsive containers handle mobile breakpoints. Custom tooltips and reference lines." icon={<BarChart2 size={16} />} />
                  <TechRow category="Styling" tech="Tailwind CSS v3 + CSS Variables" why="CSS variables for theme tokens enable dark/light mode without JavaScript. Utility-first approach keeps component files self-contained." icon={<Layers size={16} />} />
                  <TechRow category="Analytics" tech="Google Analytics 4" why="GA4 wired via custom GoogleAnalytics component in root layout. Measurement ID from environment variable." icon={<TrendingUp size={16} />} />
                  <TechRow category="Deployment" tech="Netlify + Supabase Cloud" why="Netlify handles Next.js SSR via @netlify/plugin-nextjs. Supabase Cloud manages database, auth, storage, and edge functions." icon={<Zap size={16} />} />
                </div>
              </div>
            </Section>

            <Section id="built" title="What Was Built" subtitle="12 production modules, each with a defined operational purpose">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {builtModules.map((m) => (
                  <div key={m.name} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">{m.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-foreground">{m.name}</p>
                        <span className="text-xs bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">Live</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="outcomes" title="Outcomes & Signals" subtitle="What this project demonstrates to a hiring manager or client">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { signal: 'Business Analysis Depth', detail: 'KPI definitions are grounded in CS operations theory. The health score formula, 9-stage model, and revenue-at-risk calculation reflect understanding of how CS teams actually measure success.', icon: <Target size={16} />, color: 'bg-blue-500/10 text-blue-600' },
                  { signal: 'Full-Stack Architecture', detail: 'End-to-end ownership: PostgreSQL schema design, RLS policies, Next.js server/client component split, API route security, edge function deployment, and CI/CD via Netlify.', icon: <Layers size={16} />, color: 'bg-violet-500/10 text-violet-600' },
                  { signal: 'Security-First Thinking', detail: 'RBAC enforced at 3 layers: middleware (route), component (UI), and database (RLS). API keys never exposed to the browser.', icon: <Shield size={16} />, color: 'bg-red-500/10 text-red-600' },
                  { signal: 'AI Integration Maturity', detail: 'Not a chatbot wrapper. The AI Assistant has a domain-specific system prompt, streaming responses, multi-turn context window, and persistent chat history in Supabase.', icon: <Brain size={16} />, color: 'bg-amber-500/10 text-amber-600' },
                  { signal: 'Operational Thinking', detail: 'Every feature has a defined operational purpose. The audit log exists because compliance requires it. The SLA tracker exists because breach notifications are contractual.', icon: <Cpu size={16} />, color: 'bg-emerald-500/10 text-emerald-600' },
                  { signal: 'Stakeholder Awareness', detail: '6-role RBAC reflects understanding that a B2B platform serves multiple stakeholders with different information needs. The CEO view and the Support Agent view are architecturally different.', icon: <Users size={16} />, color: 'bg-teal-500/10 text-teal-600' },
                ].map((s) => (
                  <div key={s.signal} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
                      <div><p className="text-sm font-bold text-foreground mb-1">{s.signal}</p><p className="text-xs text-muted-foreground leading-relaxed">{s.detail}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="next" title="What's Next" subtitle="The honest backlog — what would make this production-ready for a real CS team">
              <div className="space-y-3">
                {[
                  { item: 'Connect Reports & Analytics to live Supabase data', priority: 'High', effort: 'Medium', why: 'Currently uses sample data. Real data would make the charts reflect actual customer health trends.' },
                  { item: 'Add notifications table + event-driven write triggers', priority: 'High', effort: 'Medium', why: 'Notifications page is static. Real notifications require database triggers on risk_alerts and sla_breaches.' },
                  { item: 'Audit log write calls on key user actions', priority: 'Medium', effort: 'Low', why: 'The audit log reads correctly but nothing writes to it. Adding insert calls on login, export, and customer update would make it a real compliance trail.' },
                  { item: 'Predictive churn model using milestone velocity data', priority: 'Medium', effort: 'High', why: 'The data model already supports it. A logistic regression on milestone completion rate + TTV delta would give a 30-day churn probability score.' },
                  { item: 'Customer-facing onboarding portal', priority: 'Low', effort: 'High', why: 'The internal CS view is complete. A customer-facing portal showing their own milestone progress would close the loop on the onboarding experience.' },
                  { item: 'CRM integration (Salesforce / HubSpot)', priority: 'Low', effort: 'High', why: 'Real CS teams need COIS to pull contract data from CRM. A webhook-based sync would eliminate manual customer creation.' },
                ].map((row) => (
                  <div key={row.item} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-foreground">{row.item}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.priority === 'High' ? 'bg-red-500/10 text-red-600' : row.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'}`}>{row.priority} priority</span>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{row.effort} effort</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{row.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-lg font-bold text-foreground mb-2">Want to discuss this project?</p>
              <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">I'm available for BA, product, and CS operations roles. Happy to walk through any part of the architecture or design thinking in detail.</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <a href="mailto:lavishpandey67@gmail.com" className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                  <Mail size={15} /> lavishpandey67@gmail.com
                </a>
                <a href="https://linkedin.com/in/lavish-pandey-2846273a4" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-muted text-foreground text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-muted/80 transition-colors border border-border">
                  <ExternalLink size={15} /> LinkedIn
                </a>
              </div>
            </div>
          </main>
        </div>
      </AppLayout>
      <StickyShareWidget
        pageTitle="COIS Case Study — B2B SaaS Platform Build by Lavish Pandey"
        githubUrl="https://github.com/lavishpandey67"
        linkedinUrl="https://linkedin.com/in/lavishpandey"
      />
    </>
  );
}
