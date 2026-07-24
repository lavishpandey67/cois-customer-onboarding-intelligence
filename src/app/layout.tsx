import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

export const metadata: Metadata = {
  title: 'COIS — Customer Onboarding Intelligence System',
  description:
  'A customer onboarding operations platform demonstrating product thinking, KPI architecture, and AI-assisted risk detection. Portfolio project by Lavish Pandey — AI Business & Operations Analyst.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }]
  },
  openGraph: {
    type: 'website',
    url: 'https://cois8196.builtwithrocket.new',
    title: 'COIS — Customer Onboarding Intelligence System',
    description:
    'A customer onboarding operations platform demonstrating product thinking, KPI architecture, and AI-assisted risk detection. Portfolio project by Lavish Pandey — AI Business & Operations Analyst.',
    siteName: 'COIS Portfolio Project',
    images: [
    {
      url: "https://img.rocket.new/generatedImages/rocket_gen_img_15b300c03-1764660631226.png",
      width: 1200,
      height: 630,
      alt: 'COIS — Customer Onboarding Intelligence System dashboard preview'
    }]

  },
  twitter: {
    card: 'summary_large_image',
    title: 'COIS — Customer Onboarding Intelligence System',
    description:
    'A customer onboarding operations platform demonstrating product thinking, KPI architecture, and AI-assisted risk detection. Portfolio project by Lavish Pandey — AI Business & Operations Analyst.',
    images: ['https://cois8196.builtwithrocket.new/assets/images/app_logo.png'],
    creator: '@lavishpandey67'
  }
};

export default function RootLayout({
  children
}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>{children}

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fcois8196back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.19" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>);

}