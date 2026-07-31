import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cois8196.builtwithrocket.new';

export const metadata: Metadata = {
  title: 'Deployment Pipeline — CI/CD Monitor',
  description: 'Live CI/CD pipeline monitor — GitHub Actions, Azure DevOps, Docker build stages, deployment status, and rollback controls for Production and Staging environments.',
  openGraph: {
    title: 'COIS Deployment Pipeline — CI/CD Monitor',
    description: 'Live CI/CD pipeline monitor — GitHub Actions, Azure DevOps, Docker build stages, deployment status, and rollback controls.',
    url: `${siteUrl}/deployment-pipeline`,
    images: [
      {
        url: `${siteUrl}/api/og?page=pipeline`,
        width: 1200,
        height: 630,
        alt: 'COIS Deployment Pipeline showing CI/CD build stages and status',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COIS Deployment Pipeline — CI/CD Monitor',
    description: 'Live CI/CD pipeline monitor — GitHub Actions, Azure DevOps, Docker build stages, deployment status, and rollback controls.',
    images: [`${siteUrl}/api/og?page=pipeline`],
  },
};

export { default } from './DeploymentPipelineClient';
