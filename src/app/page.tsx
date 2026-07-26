'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import DashboardChartsRow from './components/DashboardChartsRow';
import RiskAlertsTable from './components/RiskAlertsTable';
import AIInsightsPanel from './components/AIInsightsPanel';
import ActivityFeedPanel from './components/ActivityFeedPanel';
import PDFExportButton from '@/components/PDFExportButton';
import { createClient } from '@/lib/supabase/client';
import { Wifi, WifiOff } from 'lucide-react';

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

function RealtimeIndicator() {
  const [connected, setConnected] = useState(false);
  const [pulse, setPulse] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase?.channel('dashboard_presence')?.on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        setPulse(true);
        setTimeout(() => setPulse(false), 1500);
      })?.subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => { supabase?.removeChannel(channel); };
  }, []);

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-600 transition-all ${
      connected
        ? 'bg-green-50 border-green-200 text-green-700' :'bg-muted border-border text-muted-foreground'
    }`}>
      {connected ? (
        <>
          <span className={`w-1.5 h-1.5 rounded-full bg-green-500 ${pulse ? 'animate-ping' : 'animate-pulse'}`} />
          <Wifi size={11} />
          Live
        </>
      ) : (
        <>
          <WifiOff size={11} />
          Connecting…
        </>
      )}
    </div>
  );
}

export default function ExecutiveDashboardPage() {
  return (
    <AppLayout
      title="Executive Dashboard"
      subtitle=""
    >
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-start justify-between -mt-4 flex-wrap gap-3">
          <div>
            <p className="text-xs text-muted-foreground">
              <LiveTimestamp />
            </p>
            <p className="text-sm italic text-muted-foreground mt-1">
              B2B SaaS Platform — Demo Environment | 50 active customer onboardings | Prototype case study
            </p>
            <p className="text-xs italic text-muted-foreground mt-0.5">
              All data is sample/demonstration data. This is a portfolio prototype.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RealtimeIndicator />
            <PDFExportButton
              targetId="dashboard-content"
              filename="executive-dashboard"
              label="Export Dashboard PDF"
            />
          </div>
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