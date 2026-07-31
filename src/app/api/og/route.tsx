import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const PAGE_CONFIGS: Record<string, { title: string; subtitle: string; accent: string; tag: string }> = {
  landing: {
    title: 'COIS Platform',
    subtitle: 'Customer Onboarding Intelligence System — B2B SaaS Portfolio Project',
    accent: '#3b82f6',
    tag: 'Marketing',
  },
  portfolio: {
    title: 'Portfolio Showcase',
    subtitle: 'Full-stack B2B SaaS engineering — CI/CD, Supabase, GitHub API, Next.js 15',
    accent: '#8b5cf6',
    tag: 'Portfolio · Lavish Pandey',
  },
  'case-study': {
    title: 'Case Study',
    subtitle: 'How COIS was designed and built — BA portfolio with KPI architecture & tech decisions',
    accent: '#10b981',
    tag: 'Case Study · B2B SaaS',
  },
  pipeline: {
    title: 'Deployment Pipeline',
    subtitle: 'Live CI/CD monitor — 10-stage pipeline, Docker builds, and production deploys',
    accent: '#f59e0b',
    tag: 'DevOps · CI/CD',
  },
  infrastructure: {
    title: 'Infrastructure Status',
    subtitle: 'Real-time environment health — AWS, Azure, CPU/memory metrics, incident management',
    accent: '#ef4444',
    tag: 'DevOps · Infrastructure',
  },
  dashboard: {
    title: 'Executive Dashboard',
    subtitle: 'Real-time onboarding intelligence — 50 customers, SLA tracking, AI insights',
    accent: '#06b6d4',
    tag: 'Dashboard · Analytics',
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || 'landing';
  const config = PAGE_CONFIGS[page] || PAGE_CONFIGS['landing'];

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            opacity: 0.4,
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '400px',
            background: `radial-gradient(ellipse, ${config.accent}33 0%, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 80px',
            height: '100%',
            gap: '0',
          }}
        >
          {/* Tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: `${config.accent}22`,
                border: `1px solid ${config.accent}44`,
                color: config.accent,
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              {config.tag}
            </div>
            <div
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#94a3b8',
                fontSize: '13px',
              }}
            >
              cois8196.builtwithrocket.new
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}
          >
            {config.title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '22px',
              color: '#94a3b8',
              lineHeight: 1.5,
              maxWidth: '800px',
              marginBottom: '40px',
            }}
          >
            {config.subtitle}
          </div>

          {/* Bottom row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, #3b82f6, #8b5cf6)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white',
                fontWeight: 800,
              }}
            >
              C
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700 }}>
                COIS — Customer Onboarding Intelligence System
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                Built by Lavish Pandey · Next.js 15 · Supabase · OpenAI
              </div>
            </div>
          </div>
        </div>

        {/* Right accent bar */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '6px',
            background: `linear-gradient(to bottom, ${config.accent}, transparent)`,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
