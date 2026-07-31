'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricsBentoGrid from '../components/MetricsBentoGrid';
import DashboardChartsRow from '../components/DashboardChartsRow';
import RiskAlertsTable from '../components/RiskAlertsTable';
import AIInsightsPanel from '../components/AIInsightsPanel';
import ActivityFeedPanel from '../components/ActivityFeedPanel';
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

  return <span className="text-xs text-muted-foreground">{timestamp}</span>;
}

function RealtimeIndicator() {
  const [connected, setConnected] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase?.channel('realtime-indicator')?.subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });
    return () => { supabase?.removeChannel(channel); };
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {connected ? (
        <>
          <Wifi size={12} className="text-green-600" />
          <span className="text-xs text-green-600 font-600">Live</span>
        </>
      ) : (
        <>
          <WifiOff size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Connecting…</span>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppLayout
      title="Dashboard"
      subtitle="Customer Onboarding Intelligence — real-time health, milestones, and risk signals"
      headerRight={
        <div className="flex items-center gap-3">
          <RealtimeIndicator />
          <LiveTimestamp />
          <PDFExportButton filename="cois-dashboard" />
        </div>
      }
    >
      <div className="space-y-6">
        <MetricsBentoGrid />
        <DashboardChartsRow />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <RiskAlertsTable />
          </div>
          <div className="space-y-5">
            <AIInsightsPanel />
            <ActivityFeedPanel />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
