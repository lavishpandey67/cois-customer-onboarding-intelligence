# COIS — Customer Onboarding Intelligence System

> A production-grade B2B SaaS CS operations platform. Built to demonstrate product thinking, KPI architecture, RBAC design, and AI-assisted risk detection in a customer success operations context.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cois--indol.vercel.app-1D4ED8)](https://cois-indol.vercel.app)
[![Portfolio](https://img.shields.io/badge/Built%20by-Lavish%20Pandey-0891B2)](https://linkedin.com/in/lavish-pandey-2846273a4)
[![GitHub](https://img.shields.io/badge/GitHub-lavishpandey67-181717)](https://github.com/lavishpandey67)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-96%25-3178C6)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E)](https://supabase.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000)](https://vercel.com)

---

**Live Demo:** https://cois-indol.vercel.app
**GitHub:** https://github.com/lavishpandey67/cois-customer-onboarding-intelligence
**Built by:** Lavish Pandey · [LinkedIn](https://linkedin.com/in/lavish-pandey-2846273a4) · lavishpandey67@gmail.com

---

## The Problem

B2B SaaS companies lose significant ARR during customer onboarding. CS teams managing 30–80 simultaneous onboardings have no unified view of customer health, milestone progress, risk signals, or SLA compliance — leading to delayed Go Lives, preventable churn, and missed expansion opportunities.

Without a unified intelligence system, CS teams react to problems instead of preventing them.

---

## What I Built

COIS is a Customer Onboarding Intelligence System — a full CS operations platform for B2B SaaS teams managing 30–80 simultaneous customer onboardings. It tracks Time to Value, health scores, milestone progress, SLA compliance, and risk signals in real time.

**12 working modules:** Executive Dashboard · Customer Management · Task Management (Kanban) · Milestones · SLA Tracker · AI Assistant (OpenAI streaming) · Analytics · Reports · Audit Log · Team Management · Notifications · Administration

**Additional pages:** Landing Page · User Profile · Knowledge Base · Customer Timeline · User Analytics · Deployment Pipeline · Infrastructure Status · Case Study · Portfolio Showcase

---

## Key Metrics Tracked

| Metric | Value | Business Meaning |
|---|---|---|
| Activation Rate | 74.2% | 37 of 50 customers reached First Value milestone |
| Avg Time to Value | 41 days | vs 52-day target — 11 days ahead |
| Avg Health Score | 68.4 / 100 | 18 customers below 60 threshold |
| Revenue at Risk | $632K | From 9 at-risk onboardings |
| Onboarding CSAT | 4.3 / 5 | Based on 28 post-onboarding surveys |
| SLA Compliance | 94% | Milestones completed within SLA |

---

## Design Decisions

**Why Time to Value as the primary metric?**
TTV directly predicts long-term retention in SaaS. Customers reaching First Value quickly show significantly higher 12-month retention rates. A TTV of 41 days vs a 52-day target tells the whole onboarding story in one number.

**Why a 0–100 health score instead of traffic lights?**
Traffic lights force binary decisions. A 0–100 scale shows direction of movement — a score dropping from 72 to 61 is a different conversation than one sitting stable at 44.

**Why Revenue at Risk instead of customer count?**
Showing 9 at-risk customers means nothing to a CFO. Showing $632K ARR exposure immediately translates onboarding health into financial risk — the language leadership uses to make resource allocation decisions.

**Why RBAC with 6 role tiers?**
Real CS operations platforms need role-based access. An Admin sees everything. A Support Agent sees only their assigned customers. Building RBAC from the start demonstrates product architecture thinking, not just UI design.

---

## Skills Demonstrated

| Area | Evidence in This Project |
|---|---|
| Business Analysis | KPI selection, health score architecture, risk framework design |
| Product Design | 20+ page information architecture, user flow, edge case thinking |
| AI Operations | OpenAI streaming integration, AI insight card design |
| BI & Analytics | Revenue risk quantification, trend analysis, SLA monitoring |
| Technical | Next.js 15, TypeScript, Supabase, OpenAI API, RBAC, Edge Functions |

---

## Tech Stack

**Tech stack:** Next.js 15 · TypeScript · Supabase (PostgreSQL + Auth + Realtime + Edge Functions) · OpenAI GPT-4o-mini · Resend · Recharts · Tailwind CSS · Vercel

---

## Demo Accounts

Six demo users are seeded by the auth migration:

| Role | Email | Password |
|---|---|---|
| Admin | admin@cois.demo | Admin@123! |
| CEO | ceo@cois.demo | Admin@123! |
| Operations Director | ops@cois.demo | Admin@123! |
| CS Manager | manager@cois.demo | Admin@123! |
| CS Specialist | specialist@cois.demo | Admin@123! |
| Support Agent | support@cois.demo | Admin@123! |

---

## Deployment Guide

This guide covers the full deployment path: Supabase setup → environment variables → GitHub → Vercel.

### Step 1 — Create a Supabase Project

1. Go to supabase.com and sign in
2. Click **New Project**
3. Choose your organisation, set a project name (e.g. `cois-production`), set a strong database password, and select your region
4. Wait ~2 minutes for the project to provision
5. Go to **Project Settings → API**
6. Copy:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2 — Run Database Migrations

The migrations are in `supabase/migrations/`. Run them in order:

**Option A — Supabase Dashboard (no CLI needed)**

1. In your Supabase project, go to **SQL Editor**
2. Open each migration file in order and paste + run:
   - `20260726000000_cois_core_tables.sql`
   - `20260726010000_auth_roles.sql`
   - `20260726020000_audit_sla_team.sql`
   - `20260726030000_ai_chat_history.sql`
   - `20260726040000_simulator_events.sql`
3. Each file creates tables, RLS policies, indexes, and seed data
4. After running all 5, go to **Table Editor** — you should see 12+ tables

**Option B — Supabase CLI**

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### Step 3 — Deploy the Email Edge Function

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy send-notification
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

The function handles 4 email types: `risk_alert`, `team_invitation`, `password_reset`, `sla_breach`

### Step 4 — Configure Authentication

1. In Supabase Dashboard, go to **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g. `https://cois-indol.vercel.app`)
3. Add to **Redirect URLs**:
   - `https://cois-indol.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`

### Step 5 — Set Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase — Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI — Required for AI Assistant
OPENAI_API_KEY=sk-your-openai-key-here

# Resend — Required for email notifications
RESEND_API_KEY=re_your-resend-key-here

# Google Analytics — Optional
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Site URL
NEXT_PUBLIC_SITE_URL=https://cois-indol.vercel.app
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `OPENAI_API_KEY` | platform.openai.com → API Keys |
| `RESEND_API_KEY` | resend.com → API Keys |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics → Admin → Data Streams → Measurement ID |

### Step 6 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: COIS — Customer Onboarding Intelligence System"
git remote add origin https://github.com/lavishpandey67/cois-customer-onboarding-intelligence.git
git branch -M main
git push -u origin main
```

### Step 7 — Deploy to Vercel

1. Go to vercel.com → **Add New Project → Import Git Repository**
2. Connect GitHub and select `cois-customer-onboarding-intelligence`
3. Build settings are auto-detected (Next.js)
4. Click **Deploy**
5. Go to **Project Settings → Environment Variables**
6. Add all variables from Step 5
7. **Redeploy** to apply variables

### Step 8 — Verify the Deployment

- **Auth:** Visit `/login` → use `admin@cois.demo` / `Admin@123!`
- **Database:** Dashboard should show customer cards and KPI metrics
- **AI Assistant:** Go to `/ai-assistant` → send a message → streaming response
- **Realtime:** Green dot in dashboard top-right = Supabase Realtime connected

---

## Local Development

```bash
git clone https://github.com/lavishpandey67/cois-customer-onboarding-intelligence.git
cd cois-customer-onboarding-intelligence
npm install
# Create .env.local with your keys
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages (20+ routes)
│   │   ├── dashboard/          # Executive Dashboard
│   │   ├── customer-management/
│   │   ├── task-management/    # Kanban board
│   │   ├── milestones/
│   │   ├── sla-tracker/
│   │   ├── ai-assistant/       # OpenAI streaming chat
│   │   ├── analytics/
│   │   ├── reports/
│   │   ├── audit-log/
│   │   ├── team-management/
│   │   ├── administration/
│   │   ├── notifications/
│   │   ├── knowledge-base/
│   │   ├── customer-timeline/
│   │   ├── case-study/         # BA portfolio case study
│   │   └── api/ai/             # OpenAI API route
│   ├── components/             # Shared UI components
│   ├── contexts/               # AuthContext (RBAC)
│   ├── lib/
│   │   ├── supabase/           # Client, server, dataService
│   │   └── ai/                 # OpenAI client + chat completion
│   └── middleware.ts           # Route protection
├── supabase/
│   ├── functions/              # Edge functions (Resend email)
│   └── migrations/             # 5 PostgreSQL migrations
```

---

## Troubleshooting

**Build fails on Vercel** — Check all environment variables are set. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present.

**Login redirects to wrong URL** — Update Supabase Auth → URL Configuration → Site URL to your Vercel URL. Add `/auth/callback` to Redirect URLs.

**AI Assistant returns errors** — Verify `OPENAI_API_KEY` is set in Vercel environment variables with sufficient credits.

**Database shows no data** — Confirm all 5 migrations ran successfully. Check Table Editor — customers table should have 15 rows.

---

## What I Would Build Next

- Live customer data pipeline replacing sample/seed data
- Slack and email alerts for automated risk triggers
- Predictive churn model using historical milestone data
- Customer-facing self-service onboarding portal
- Salesforce and HubSpot bi-directional CRM sync

---

## Portfolio Context

> All demo data is sample/seed data. The platform is production-architected but uses demonstration values for portfolio purposes. See the full case study at `/case-study` in the running app.

---

## About

**Lavish Pandey** — AI Business & Operations Analyst

Building at the intersection of AI, business operations, and intelligence systems.

- Email: lavishpandey67@gmail.com
- LinkedIn: [linkedin.com/in/lavish-pandey-2846273a4](https://linkedin.com/in/lavish-pandey-2846273a4)
- GitHub: [github.com/lavishpandey67](https://github.com/lavishpandey67)
- AgentOps Project: [agentops-lavish.netlify.app](https://agentops-lavish.netlify.app)

---

*Portfolio Project — 2026*
