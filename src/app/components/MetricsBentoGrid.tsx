import React from 'react';
import { TrendingUp, TrendingDown, Clock, HeartPulse, AlertTriangle, CheckCircle2, DollarSign, Star, Zap } from 'lucide-react';

interface KPICardProps {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  trend?: { direction: 'up' | 'down'; value: string; positive: boolean };
  icon: React.ReactNode;
  variant?: 'default' | 'alert' | 'warning' | 'positive' | 'hero';
  colSpan?: string;
  tooltip: string;
}

function InfoTooltip({ text, variant }: { text: string; variant: string }) {
  const isHero = variant === 'hero';
  return (
    <span className="relative group inline-flex items-center ml-1">
      <span
        className={`cursor-help text-xs select-none ${isHero ? 'text-primary-foreground/60 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
        aria-label="More information"
      >
        ⓘ
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-popover border border-border text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 leading-relaxed">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
      </span>
    </span>
  );
}

function KPICard({
  label,
  value,
  subValue,
  trend,
  icon,
  variant = 'default',
  colSpan = '',
  tooltip,
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
    variant === 'hero' ? 'bg-primary-foreground/20 text-primary-foreground'
      : variant === 'alert' ? 'bg-red-100 text-red-600'
      : variant === 'warning' ? 'bg-amber-100 text-amber-600'
      : variant === 'positive' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground';

  return (
    <div
      className={`rounded-xl border p-5 flex flex-col justify-between ${variantStyles[variant]} ${colSpan}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className={`text-xs font-600 uppercase tracking-wider ${labelColor} flex items-center`}>
          {label}
          <InfoTooltip text={tooltip} variant={variant} />
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
        tooltip="Percentage of customers who have reached their First Value milestone. Target: above 70%."
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
        tooltip="Average days from contract signed to First Value milestone. Target: under 52 days."
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
        tooltip="Composite score 0-100 based on milestone progress, engagement, and support activity. Below 60 requires action."
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
        tooltip="Customers flagged for critical health issues requiring immediate intervention."
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
        tooltip="Open issues requiring CS manager attention within 24 hours."
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
        tooltip="Percentage of milestones completed on schedule across all customers."
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
        tooltip="Total ARR from customers with health scores below 60 or escalated status."
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
        tooltip="Post-onboarding satisfaction score from customer surveys. Target: above 4.0/5."
      />
    </div>
  );
}