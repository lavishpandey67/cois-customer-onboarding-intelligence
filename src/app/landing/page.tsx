import type { Metadata } from 'next';
import LandingPageClient from './LandingPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cois8196.builtwithrocket.new';

export const metadata: Metadata = {
  title: 'COIS — Customer Onboarding Intelligence System | B2B SaaS Platform',
  description: 'Real-time onboarding intelligence, SLA tracking, AI-powered insights, and DevOps pipeline monitoring. Built by Lavish Pandey — full-stack B2B SaaS portfolio project.',
  openGraph: {
    title: 'COIS — Customer Onboarding Intelligence System',
    description: 'Real-time onboarding intelligence, SLA tracking, AI-powered insights, and DevOps pipeline monitoring for B2B SaaS teams.',
    url: `${siteUrl}/landing`,
    images: [
      {
        url: `${siteUrl}/api/og?page=landing`,
        width: 1200,
        height: 630,
        alt: 'COIS — B2B SaaS Customer Onboarding Intelligence System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COIS — Customer Onboarding Intelligence System',
    description: 'Real-time onboarding intelligence, SLA tracking, AI-powered insights, and DevOps pipeline monitoring.',
    images: [`${siteUrl}/api/og?page=landing`],
  },
};

export default function LandingPage() {
  return <LandingPageClient />;
}
