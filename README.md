# COIS — Customer Onboarding Intelligence System

> A customer onboarding operations platform designed for B2B SaaS teams. Built to demonstrate product thinking, KPI architecture, and AI-assisted risk detection in a CS operations context.

**Live Demo:** https://ciosprototype.netlify.app

---

## The Problem

B2B SaaS companies lose significant ARR during customer onboarding. CS teams managing 30–80 simultaneous onboardings have no unified view of customer health, milestone progress, or risk signals — leading to delayed Go Lives, preventable churn, and missed expansion opportunities.

## What I Built

A full CS operations platform with 9 working pages:

- **Executive Dashboard** — 8 KPI cards, 12-week Time-to-Value trend, AI insights with clickable modals, risk alert table
- **Customer Management** — Health scoring (0–100), 9 onboarding stages, customer detail drawer
- **Task Management** — Kanban board with Backlog / In Progress / Blocked / In Review
- **Analytics** — Stage distribution, tier breakdown, operational intelligence charts
- **Reports** — Pre-built at-risk customer report, monthly summary, TTV analysis
- **AI Assistant** — Pre-built prompt interface with sample CS operations responses
- **Customer Timeline** — Full event log across all customers with milestone tracking
- **Milestones** — Stage-by-stage completion tracking across all 15 customers
- **Knowledge Base, Notifications, Administration** — Supporting ops infrastructure

## Key Metrics Tracked

| Metric | Value | Note |
|---|---|---|
| Activation Rate | 74.2% | 37 of 50 customers reached First Value |
| Avg Time to Value | 41 days | vs 52-day target |
| Avg Health Score | 68.4 | 18 customers below 60 threshold |
| Revenue at Risk | $632K | From 9 at-risk onboardings |
| Onboarding CSAT | 4.3/5 | Based on 28 post-onboarding surveys |

## Design Decisions

**Why Time to Value as the primary metric?**
TTV directly predicts long-term retention. Customers reaching First Value quickly show significantly higher 12-month retention rates.

**Why a 0–100 health score?**
Traffic lights force binary decisions. A 0–100 scale shows direction of movement — a score dropping from 72 to 61 is a different conversation than one stable at 44.

**Why AI Insights as separate cards?**
Inline alerts create alert fatigue. Dedicated cards with click-through review and Mark-as-Reviewed accountability increase action probability.

## What I Would Build Next

- Supabase backend replacing sample data
- Live AI Assistant connected to Claude API
- Slack/email alerts for risk triggers
- Predictive churn model using milestone data
- Customer-facing onboarding portal
- CRM integration (Salesforce / HubSpot)

## Tech Stack

Next.js · Tailwind CSS · Recharts · Deployed on Netlify

## About

Built by **Lavish Pandey** as a portfolio project demonstrating business analysis, product design, and AI operations thinking.

- Email: lavishpandey67@gmail.com
- LinkedIn: linkedin.com/in/lavish-pandey-2846273a4

> Note: All data is sample/demonstration data. This is a portfolio prototype built to demonstrate CS operations design thinking.
