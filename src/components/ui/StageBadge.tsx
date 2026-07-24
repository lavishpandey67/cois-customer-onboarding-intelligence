import React from 'react';
import type { OnboardingStage } from '@/lib/mockData';

const stageColors: Record<OnboardingStage, string> = {
  'Contract Signed': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Kickoff Meeting': 'bg-violet-50 text-violet-700 border-violet-200',
  'Account Setup': 'bg-sky-50 text-sky-700 border-sky-200',
  Configuration: 'bg-blue-50 text-blue-700 border-blue-200',
  Training: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'First Login': 'bg-green-50 text-green-700 border-green-200',
  'First Value': 'bg-lime-50 text-lime-700 border-lime-200',
  'Go Live': 'bg-primary/10 text-primary border-primary/20',
  'Success Handoff': 'bg-slate-100 text-slate-700 border-slate-200',
};

interface StageBadgeProps {
  stage: OnboardingStage;
}

export default function StageBadge({ stage }: StageBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-600 border ${stageColors[stage]}`}
    >
      {stage}
    </span>
  );
}