import React, { useEffect } from 'react';

type BadgeVariant =
  | 'excellent' |'good' |'fair' |'poor' |'critical' |'high' |'medium' |'low' |'enterprise' |'mid-market' |'smb' |'default';

const variantStyles: Record<BadgeVariant, string> = {
  excellent: 'bg-health-excellent text-health-excellent',
  good: 'bg-health-good text-health-good',
  fair: 'bg-health-fair text-health-fair',
  poor: 'bg-health-poor text-health-poor',
  critical: 'bg-red-50 text-red-700 border border-red-200',
  high: 'bg-orange-50 text-orange-700 border border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  low: 'bg-slate-100 text-slate-600',
  enterprise: 'bg-primary/10 text-primary',
  'mid-market': 'bg-accent/10 text-accent',
  smb: 'bg-secondary text-secondary-foreground',
  default: 'bg-muted text-muted-foreground',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-600 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
const BadgeVariant: React.FC = () => {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn('Placeholder: BadgeVariant is not implemented yet.');
  }, []);
  return (
    <div>
      {/* BadgeVariant placeholder */}
    </div>
  );
};

export { BadgeVariant };