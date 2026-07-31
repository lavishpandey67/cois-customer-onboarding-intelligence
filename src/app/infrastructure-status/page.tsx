import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cois8196.builtwithrocket.new';

export const metadata: Metadata = {
  title: 'Infrastructure Status — Environment Health',
  description: 'Real-time infrastructure health dashboard — Production (AWS us-east-1), Staging (Azure westeurope), and Dev environments with CPU, memory, uptime, and incident history.',
  openGraph: {
    title: 'COIS Infrastructure Status — Environment Health',
    description: 'Real-time infrastructure health dashboard — Production, Staging, and Dev environments with CPU, memory, uptime, and incident history.',
    url: `${siteUrl}/infrastructure-status`,
    images: [
      {
        url: `${siteUrl}/api/og?page=infrastructure`,
        width: 1200,
        height: 630,
        alt: 'COIS Infrastructure Status showing environment health across AWS and Azure',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COIS Infrastructure Status — Environment Health',
    description: 'Real-time infrastructure health dashboard — Production, Staging, and Dev environments with CPU, memory, uptime, and incident history.',
    images: [`${siteUrl}/api/og?page=infrastructure`],
  },
};

export { default } from './InfrastructureStatusClient';
