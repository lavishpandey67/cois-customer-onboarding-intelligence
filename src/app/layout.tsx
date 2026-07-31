import React from 'react';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Suspense } from 'react';
import '../styles/index.css';
import '../styles/tailwind.css';
import { GoogleAnalyticsScripts, GoogleAnalyticsPageTracker } from '@/components/GoogleAnalytics';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cois8196.builtwithrocket.new';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'COIS — Customer Onboarding Intelligence System',
    template: '%s | COIS',
  },
  description: 'COIS is a B2B SaaS platform for customer success teams — real-time onboarding intelligence, SLA tracking, AI-powered insights, and DevOps pipeline monitoring.',
  keywords: ['customer success', 'onboarding', 'SLA tracking', 'B2B SaaS', 'customer intelligence', 'DevOps', 'pipeline monitoring'],
  authors: [{ name: 'Lavish Pandey' }],
  creator: 'Lavish Pandey',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'COIS',
    title: 'COIS — Customer Onboarding Intelligence System',
    description: 'Real-time onboarding intelligence, SLA tracking, AI-powered insights, and DevOps pipeline monitoring for B2B SaaS teams.',
    images: [
      {
        url: '/assets/images/app_logo.png',
        width: 1200,
        height: 630,
        alt: 'COIS — Customer Onboarding Intelligence System dashboard preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COIS — Customer Onboarding Intelligence System',
    description: 'Real-time onboarding intelligence, SLA tracking, AI-powered insights, and DevOps pipeline monitoring for B2B SaaS teams.',
    images: ['/assets/images/app_logo.png'],
    creator: '@lavishpandey',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <GoogleAnalyticsScripts />

<script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fcois8196back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.20" />
<script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></head>
      <body>
        <Suspense fallback={null}>
          <GoogleAnalyticsPageTracker />
        </Suspense>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontSize: '13px' } }} />
        </AuthProvider>
</body>
    </html>
  );
}