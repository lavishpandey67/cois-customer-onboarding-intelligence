import React from 'react';
import { TrendingUp, TrendingDown, Clock, HeartPulse, AlertTriangle, CheckCircle2, DollarSign, Star, Zap,  } from 'lucide-react';

interface KPICardProps {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  trend?: { direction: 'up' | 'down'; value: string; positive: boolean };
  icon: React.ReactNode;
  variant?: 'default' | 'alert' | 'warning' | 'positive' | 'hero';
  colSpan?: string;
}

function KPICard({
  label,
  value,
  subValue,
  trend,
  icon,
  variant = 'default',
  colSpan = '',
}: KPICardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    alert: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    positive: 'bg-green-50 border-green-200',
    hero: 'bg-primary text-primary-foreground border-primary',
  };

  const labelColor =
    variant === 'hero' ? 'text-primary-foreground/70' : 'text-muted-foreground';
  const valueColor = variant === 'hero' ? 'text-primary-foreground' : 'text-foreground';
  const subColor =
    variant === 'hero' ? 'text-primary-foreground/60' : 'text-muted-foreground';
  const iconBg =
    variant === 'hero' ?'bg-primary-foreground/20 text-primary-foreground'
      : variant === 'alert' ?'bg-red-100 text-red-600'
      : variant === 'warning' ?'bg-amber-100 text-amber-600'
      : variant === 'positive' ?'bg-green-100 text-green-700' :'bg-muted text-muted-foreground';

  return (
    <div
      className={`rounded-xl border p-5 flex flex-col justify-between ${variantStyles[variant]} ${colSpan}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className={`text-xs font-600 uppercase tracking-wider ${labelColor}`}>
          {label}
        </p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-3xl font-800 tabular-nums leading-none mb-1 ${valueColor}`}>
          {value}
        </p>
        {subValue && (
          <p className={`text-xs ${subColor} mt-1`}>{subValue}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.direction === 'up' ? (
              <TrendingUp
                size={13}
                className={trend.positive ? 'text-green-600' : 'text-red-500'}
              />
            ) : (
              <TrendingDown
                size={13}
                className={trend.positive ? 'text-green-600' : 'text-red-500'}
              />
            )}
            <span
              className={`text-xs font-600 ${
                trend.positive ? 'text-green-700' : 'text-red-600'
              }`}
            >
              {trend.value}
            </span>
            <span className={`text-xs ${subColor}`}>vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MetricsBentoGrid() {
  // Grid plan: 8 cards → grid-cols-4
  // Row 1: hero (2 cols) + 2 regular = 4 cols
  // Row 2: 4 regular cards

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Hero — Activation Rate — spans 2 cols */}
      <KPICard
        id="kpi-activation"
        label="Activation Rate"
        value="74.2%"
        subValue="37 of 50 customers reached First Value milestone"
        trend={{ direction: 'up', value: '+3.1%', positive: true }}
        icon={<Zap size={16} />}
        variant="hero"
        colSpan="sm:col-span-2 lg:col-span-2"
      />
      {/* Time to Value */}
      <KPICard
        id="kpi-ttv"
        label="Avg Time To Value"
        value="41 days"
        subValue="Target: ≤52 days"
        trend={{ direction: 'down', value: '−11 days', positive: true }}
        icon={<Clock size={16} />}
        variant="positive"
      />
      {/* Health Score */}
      <KPICard
        id="kpi-health"
        label="Avg Health Score"
        value="68.4"
        subValue="18 customers below 60 threshold"
        trend={{ direction: 'down', value: '−2.3', positive: false }}
        icon={<HeartPulse size={16} />}
        variant="warning"
      />
      {/* Customers At Risk */}
      <KPICard
        id="kpi-at-risk"
        label="Customers At Risk"
        value="9"
        subValue="$632K ARR exposure · 2 critical"
        trend={{ direction: 'up', value: '+2', positive: false }}
        icon={<AlertTriangle size={16} />}
        variant="alert"
      />
      {/* Pending Tasks */}
      <KPICard
        id="kpi-tasks"
        label="Pending Escalations"
        value="5"
        subValue="4 blocked · 3 overdue today"
        trend={{ direction: 'up', value: '+3', positive: false }}
        icon={<CheckCircle2 size={16} />}
        variant="warning"
      />
      {/* Completion Rate */}
      <KPICard
        id="kpi-completion"
        label="Completion Rate"
        value="81.6%"
        subValue="Milestones completed on schedule"
        trend={{ direction: 'up', value: '+4.2%', positive: true }}
        icon={<TrendingUp size={16} />}
        variant="default"
      />
      {/* Revenue Impact */}
      <KPICard
        id="kpi-revenue"
        label="Revenue At Risk"
        value="$632K"
        subValue="From 9 at-risk onboardings"
        trend={{ direction: 'up', value: '+$128K', positive: false }}
        icon={<DollarSign size={16} />}
        variant="alert"
      />
      {/* CSAT */}
      <KPICard
        id="kpi-csat"
        label="Onboarding CSAT"
        value="4.3 / 5"
        subValue="Based on 28 post-onboarding surveys"
        trend={{ direction: 'up', value: '+0.2', positive: true }}
        icon={<Star size={16} />}
        variant="positive"
      />
    </div>
  );
}