import React from 'react';
import type { HealthBand } from '@/lib/mockData';

interface HealthScoreBadgeProps {
  score: number;
  band: HealthBand;
  showBar?: boolean;
}

const bandConfig: Record<
  HealthBand,
  { bg: string; text: string; bar: string; label: string }
> = {
  excellent: {
    bg: 'bg-health-excellent',
    text: 'text-health-excellent',
    bar: 'bg-green-500',
    label: 'Excellent',
  },
  good: {
    bg: 'bg-health-good',
    text: 'text-health-good',
    bar: 'bg-lime-500',
    label: 'Good',
  },
  fair: {
    bg: 'bg-health-fair',
    text: 'text-health-fair',
    bar: 'bg-amber-500',
    label: 'Fair',
  },
  poor: {
    bg: 'bg-health-poor',
    text: 'text-health-poor',
    bar: 'bg-red-500',
    label: 'Poor',
  },
};

export default function HealthScoreBadge({
  score,
  band,
  showBar = false,
}: HealthScoreBadgeProps) {
  const config = bandConfig[band];
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-700 tabular-nums ${config.bg}/15 ${config.text}`}
      >
        {score}
      </span>
      {showBar && (
        <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${config.bar} transition-all duration-300`}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
}