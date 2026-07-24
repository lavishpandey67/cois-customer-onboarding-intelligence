import AppLayout from '@/components/AppLayout';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import DashboardChartsRow from './components/DashboardChartsRow';
import RiskAlertsTable from './components/RiskAlertsTable';
import AIInsightsPanel from './components/AIInsightsPanel';
import ActivityFeedPanel from './components/ActivityFeedPanel';

export default function ExecutiveDashboardPage() {
  return (
    <AppLayout
      title="Executive Dashboard"
      subtitle="Last updated: Jul 24, 2026 · 04:14 AM UTC"
    >
      <div className="space-y-6">
        {/* Company context */}
        <p className="text-sm italic text-muted-foreground -mt-2">
          NovaFlow Technologies — B2B SaaS platform | 50 active customer onboardings | Prototype case study
        </p>
        <MetricsBentoGrid />
        <DashboardChartsRow />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RiskAlertsTable />
          </div>
          <div className="xl:col-span-1 space-y-6">
            <AIInsightsPanel />
            <ActivityFeedPanel />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}