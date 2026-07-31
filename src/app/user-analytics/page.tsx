'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const UserAnalyticsContent = dynamic(
  () => import('./UserAnalyticsContent'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 size={16} className="animate-spin" />
          Loading analytics…
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function UserAnalyticsPage() {
  return <UserAnalyticsContent />;
}
