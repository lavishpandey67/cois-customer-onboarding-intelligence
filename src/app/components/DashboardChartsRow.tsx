'use client';

import dynamic from 'next/dynamic';

const TTVTrendChart = dynamic(() => import('./TTVTrendChart'), { ssr: false });
const StageDistributionChart = dynamic(
  () => import('./StageDistributionChart'),
  { ssr: false }
);

export default function DashboardChartsRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <TTVTrendChart />
      </div>
      <div className="lg:col-span-2">
        <StageDistributionChart />
      </div>
    </div>
  );
}