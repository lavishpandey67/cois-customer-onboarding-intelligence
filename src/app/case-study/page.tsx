import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cois8196.builtwithrocket.new';

export const metadata: Metadata = {
  title: 'Case Study — COIS Platform Build',
  description: 'Full BA portfolio case study: how COIS was designed and built — business context, problem statement, KPI architecture, design decisions, tech stack, and outcomes for a B2B SaaS customer success platform.',
  openGraph: {
    title: 'COIS Case Study — B2B SaaS Platform Build by Lavish Pandey',
    description: 'Full BA portfolio case study: how COIS was designed and built — business context, KPI architecture, design decisions, tech stack, and outcomes.',
    url: `${siteUrl}/case-study`,
    images: [
      {
        url: `${siteUrl}/api/og?page=case-study`,
        width: 1200,
        height: 630,
        alt: 'COIS Case Study — B2B SaaS Customer Onboarding Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COIS Case Study — B2B SaaS Platform Build by Lavish Pandey',
    description: 'Full BA portfolio case study: how COIS was designed and built — business context, KPI architecture, design decisions, tech stack, and outcomes.',
    images: [`${siteUrl}/api/og?page=case-study`],
  },
};

export { default } from './CaseStudyClient';
