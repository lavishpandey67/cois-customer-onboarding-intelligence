'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metrics bento grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5 space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-[220px] w-full" />
        </div>
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-[220px] w-full" />
        </div>
      </div>
      {/* Table skeleton */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <Skeleton className="h-5 w-36" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center py-2 border-b border-border last:border-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32 ml-auto" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-32 rounded-lg" />
    </div>
  );
}
