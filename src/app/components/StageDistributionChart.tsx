'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { stageDistributionData } from '@/lib/mockData';

const stageColors = [
  '#6366F1', '#8B5CF6', '#0EA5E9', '#0284C7',
  '#059669', '#16A34A', '#65A30D', '#1D4ED8', '#0F172A',
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { stage: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-600 text-foreground">{payload[0].payload.stage}</p>
      <p className="text-muted-foreground mt-1">
        <span className="font-700 tabular-nums text-foreground">{payload[0].value}</span> customers
      </p>
    </div>
  );
}

export default function StageDistributionChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5 h-full">
      <div className="mb-4">
        <h3 className="text-sm font-700 text-foreground">Customers by Stage</h3>
        <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
          Distribution across 9 stages · 50 active
        </p>
      </div>
      <div className="w-full" style={{ minHeight: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={stageDistributionData}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="stage"
              type="category"
              tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={14}>
              {stageDistributionData.map((entry, index) => (
                <Cell key={`cell-stage-${entry.stage}`} fill={stageColors[index % stageColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}