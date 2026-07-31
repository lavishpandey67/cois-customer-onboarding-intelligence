'use client';

import React, { lazy, Suspense } from 'react';

import { Loader2 } from 'lucide-react';

const DeploymentPipelineClient = lazy(() => import('./DeploymentPipelineClient'));

function PageSkeleton() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 size={16} className="animate-spin" />
        Loading pipeline…
      </div>
    </div>
  );
}

export default function DeploymentPipelinePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DeploymentPipelineClient />
    </Suspense>
  );
}
