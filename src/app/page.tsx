'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import DashboardChartsRow from './components/DashboardChartsRow';
import RiskAlertsTable from './components/RiskAlertsTable';
import AIInsightsPanel from './components/AIInsightsPanel';
import ActivityFeedPanel from './components/ActivityFeedPanel';
import PDFExportButton from '@/components/PDFExportButton';

function LiveTimestamp() {
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    function formatTimestamp() {
      const now = new Date();
      const day = now?.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames?.[now?.getMonth()];
      const year = now?.getFullYear();
      const hours = String(now?.getHours())?.padStart(2, '0');
      const minutes = String(now?.getMinutes())?.padStart(2, '0');
      return `Last updated: ${day} ${month} ${year}, ${hours}:${minutes} IST`;
    }

    setTimestamp(formatTimestamp());
    const interval = setInterval(() => {
      setTimestamp(formatTimestamp());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return <span>{timestamp || 'Last updated: loading…'}</span>;
}

export default function ExecutiveDashboardPage() {
  return (
    <AppLayout
      title="Executive Dashboard"
      subtitle=""
    >
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-start justify-between -mt-4">
          <div>
            <p className="text-xs text-muted-foreground">
              <LiveTimestamp />
            </p>
            <p className="text-sm italic text-muted-foreground mt-1">
              NovaFlow Technologies — B2B SaaS platform | 50 active customer onboardings | Prototype case study
            </p>
            <p className="text-xs italic text-muted-foreground mt-0.5">
              All data is sample/demonstration data. This is a portfolio prototype.
            </p>
          </div>
          <PDFExportButton
            targetId="dashboard-content"
            filename="executive-dashboard"
            label="Export Dashboard PDF"
          />
        </div>

        <div id="dashboard-content">
          <MetricsBentoGrid />
          <div className="mt-6">
            <DashboardChartsRow />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            <div className="xl:col-span-2">
              <RiskAlertsTable />
            </div>
            <div className="xl:col-span-1 space-y-6">
              <AIInsightsPanel />
              <ActivityFeedPanel />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}