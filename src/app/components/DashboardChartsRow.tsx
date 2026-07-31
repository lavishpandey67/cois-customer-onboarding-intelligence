'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/SkeletonLoader';

const TTVTrendChart = dynamic(() => import('./TTVTrendChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <Skeleton className="h-5 w-48 mb-2" />
      <Skeleton className="h-3 w-64 mb-4" />
      <Skeleton className="h-[220px] w-full" />
    </div>
  ),
});

const StageDistributionChart = dynamic(() => import('./StageDistributionChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <Skeleton className="h-5 w-44 mb-2" />
      <Skeleton className="h-3 w-56 mb-4" />
      <Skeleton className="h-[220px] w-full" />
    </div>
  ),
});

export default function DashboardChartsRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-4 md:gap-6">
      <div className="col-span-1 lg:col-span-3 min-w-0 overflow-hidden">
        <TTVTrendChart />
      </div>
      <div className="col-span-1 lg:col-span-2 min-w-0 overflow-hidden">
        <StageDistributionChart />
      </div>
    </div>
  );
}