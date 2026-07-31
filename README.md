# COIS — Customer Onboarding Intelligence System

> A production-grade B2B SaaS CS operations platform. Built to demonstrate product thinking, KPI architecture, RBAC design, and AI-assisted risk detection in a customer success operations context.

**Live Demo:** https://cois-tau.vercel.app  
**GitHub:** https://github.com/lavishpandey67/cois-customer-onboarding-intelligence  
**Built by:** Lavish Pandey · [LinkedIn](https://linkedin.com/in/lavish-pandey-2846273a4) · lavishpandey67@gmail.com

---

## What This Is

COIS is a Customer Onboarding Intelligence System — a full CS operations platform for B2B SaaS teams managing 30–80 simultaneous customer onboardings. It tracks Time to Value, health scores, milestone progress, SLA compliance, and risk signals in real time.

**12 working modules:** Executive Dashboard · Customer Management · Task Management (Kanban) · Milestones · SLA Tracker · AI Assistant (OpenAI streaming) · Analytics · Reports · Audit Log · Team Management · Notifications · Administration

**Additional pages:** Landing Page · User Profile · Knowledge Base · Customer Timeline · User Analytics · Deployment Pipeline · Infrastructure Status · Case Study · Portfolio Showcase

**Tech stack:** Next.js 15 · TypeScript · Supabase (PostgreSQL + Auth + Realtime + Edge Functions) · OpenAI GPT-4o-mini · Resend · Recharts · Tailwind CSS · Vercel

---

## Deployment Guide

This guide covers the full deployment path: Supabase setup → environment variables → GitHub → Vercel.

---

### Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organisation, set a project name (e.g. `cois-production`), set a strong database password, and select your region
4. Wait ~2 minutes for the project to provision
5. Go to **Project Settings → API**
6. Copy:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

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
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project (get project ref from Project Settings → General)
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

---

### Step 3 — Deploy the Email Edge Function

The email notification system uses a Supabase Edge Function. Deploy it:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login and link (if not done in Step 2)
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy send-notification
```

After deploying:
1. Go to **Supabase Dashboard → Edge Functions**
2. You should see `send-notification` listed as deployed
3. The function handles 4 email types: `risk_alert`, `team_invitation`, `password_reset`, `sla_breach`

**Important:** The function uses `RESEND_API_KEY` as a secret. Set it:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

Or set it in **Supabase Dashboard → Edge Functions → send-notification → Secrets**.

---

### Step 4 — Configure Authentication

1. In Supabase Dashboard, go to **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g. `https://cois-tau.vercel.app`)
3. Add to **Redirect URLs**:
   - `https://cois-tau.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)
4. Go to **Authentication → Email Templates** — customise if needed
5. Under **Authentication → Providers**, ensure Email is enabled

---

### Step 5 — Set Environment Variables

Create a `.env.local` file in the project root (for local development):

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
NEXT_PUBLIC_SITE_URL=https://cois-tau.vercel.app
```

**Where to get each key:**

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `OPENAI_API_KEY` | platform.openai.com → API Keys |
| `RESEND_API_KEY` | resend.com → API Keys |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics → Admin → Data Streams → Measurement ID |

---

### Step 6 — Push to GitHub

```bash
# Initialise git if not already done
git init

# Add all files
git add .

# Initial commit
git commit -m "feat: COIS — Customer Onboarding Intelligence System"

# Create a new repo on github.com, then:
git remote add origin https://github.com/lavishpandey67/cois-customer-onboarding-intelligence.git
git branch -M main
git push -u origin main
```

---

### Step 7 — Deploy to Vercel

**Option A — Vercel Dashboard (recommended)**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project → Import Git Repository**
3. Connect to GitHub and select your `cois-customer-onboarding-intelligence` repository
4. Build settings (auto-detected):
   - **Framework Preset:** Next.js
   - **Build command:** `npm run build`
   - **Output directory:** `.next`
5. Click **Deploy**
6. Once deployed, go to **Project Settings → Environment Variables**
7. Add all variables from Step 5 (the same keys, with production values)
8. Trigger a redeploy: **Deployments → Redeploy**

**Option B — Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

### Step 8 — Verify the Deployment

After deploying, verify each system:

**Authentication**
- Visit `/login`
- Use a demo account: `admin@cois.demo` / `Admin@123!`
- Confirm redirect to dashboard after login

**Database**
- Dashboard should show customer cards and KPI metrics
- Customer Management should list 15 seeded customers

**Real-time**
- The green dot in the top-right of the dashboard indicates Supabase Realtime is connected

**AI Assistant**
- Go to `/ai-assistant`
- Send a message — you should get a streaming response from GPT-4o-mini

**Email (if Resend configured)**
- Go to `/administration`
- Use the "Send Test Notification" button
- Check your inbox

---

### Demo Accounts

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

### Local Development

```bash
# Clone the repo
git clone https://github.com/lavishpandey67/cois-customer-onboarding-intelligence.git
cd cois-customer-onboarding-intelligence

# Install dependencies
npm install

# Create .env.local with your keys (see Step 5)

# Start dev server
npm run dev

# Open http://localhost:3000
```

---

### Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages (20+ routes)
│   │   ├── page.tsx            # Root → redirects to /dashboard
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
│   │   ├── user-analytics/
│   │   ├── deployment-pipeline/
│   │   ├── infrastructure-status/
│   │   ├── case-study/         # BA portfolio case study
│   │   ├── portfolio-showcase/
│   │   ├── landing/            # Public marketing page
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
└── netlify.toml                # Netlify build config (legacy)
```

---

### Troubleshooting

**Build fails on Vercel**
- Check all environment variables are set in Vercel project settings
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present

**Login redirects to wrong URL**
- Update Supabase Auth → URL Configuration → Site URL to your Vercel URL
- Add `/auth/callback` to Redirect URLs

**Emails not sending**
- Confirm edge function is deployed: `supabase functions list`
- Confirm `RESEND_API_KEY` is set as a Supabase secret
- Check Resend dashboard for delivery logs

**AI Assistant returns errors**
- Verify `OPENAI_API_KEY` is set in Vercel environment variables
- Check the key has sufficient credits at platform.openai.com

**Database shows no data**
- Confirm all 5 migrations ran successfully in Supabase SQL Editor
- Check Table Editor — `customers` table should have 15 rows

---

## Key Metrics

| Metric | Value |
|---|---|
| Activation Rate | 74.2% (37/50 customers) |
| Avg Time to Value | 41 days (vs 52-day target) |
| Avg Health Score | 68.4/100 |
| Revenue at Risk | $632K |
| Onboarding CSAT | 4.3/5 |
| SLA Compliance | 94% |

---

## Repository

- **GitHub:** [lavishpandey67/cois-customer-onboarding-intelligence](https://github.com/lavishpandey67/cois-customer-onboarding-intelligence)
- **Topics:** `customer-success` `business-intelligence` `ai-operations` `nextjs` `tailwindcss` `kpi-dashboard` `portfolio`
- **Visibility:** Public

---

## About

Built by **Lavish Pandey** — Business Analyst with a focus on CS operations, product design, and AI-assisted workflows.

- Email: lavishpandey67@gmail.com
- LinkedIn: [linkedin.com/in/lavish-pandey-2846273a4](https://linkedin.com/in/lavish-pandey-2846273a4)
- Live Demo: [cois-tau.vercel.app](https://cois-tau.vercel.app)

See the full case study at `/case-study` in the running app.

> All demo data is sample/seed data. The platform is production-architected but uses demonstration values for portfolio purposes.
