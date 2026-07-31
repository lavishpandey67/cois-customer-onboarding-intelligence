import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cois8196.builtwithrocket.new';

export const metadata: Metadata = {
  title: 'Portfolio Showcase — Lavish Pandey · GitHub · Git Workflow',
  description: 'Portfolio showcase for COIS platform — B2B SaaS engineering, CI/CD pipelines, Supabase backend, GitHub workflow, and full-stack TypeScript development by Lavish Pandey.',
  openGraph: {
    title: 'Portfolio Showcase — Lavish Pandey · B2B SaaS Engineering',
    description: 'Full-stack B2B SaaS platform with CI/CD pipelines, Supabase backend, real-time analytics, and DevOps infrastructure.',
    url: `${siteUrl}/portfolio-showcase`,
    images: [
      {
        url: `${siteUrl}/api/og?page=portfolio`,
        width: 1200,
        height: 630,
        alt: 'COIS Portfolio Showcase by Lavish Pandey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio Showcase — Lavish Pandey · B2B SaaS Engineering',
    description: 'Full-stack B2B SaaS platform with CI/CD pipelines, Supabase backend, real-time analytics, and DevOps infrastructure.',
    images: [`${siteUrl}/api/og?page=portfolio`],
  },
};

export { default } from './PortfolioShowcaseClient';
