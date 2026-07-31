import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Onboarding Intelligence',
  description: 'Live customer onboarding dashboard — health scores, milestone progress, risk alerts, and AI-powered insights for your entire portfolio.',
  openGraph: {
    title: 'COIS Dashboard — Onboarding Intelligence',
    description: 'Live customer onboarding dashboard — health scores, milestone progress, risk alerts, and AI-powered insights for your entire portfolio.',
    url: '/dashboard',
    images: [{ url: '/assets/images/app_logo.png', width: 1200, height: 630, alt: 'COIS Dashboard showing customer health scores and onboarding metrics' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COIS Dashboard — Onboarding Intelligence',
    description: 'Live customer onboarding dashboard — health scores, milestone progress, risk alerts, and AI-powered insights.',
    images: ['/assets/images/app_logo.png'],
  },
};

export { default } from './DashboardClient';
