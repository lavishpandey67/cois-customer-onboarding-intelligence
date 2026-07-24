'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,  } from 'recharts';
import { ttvTrendData } from '@/lib/mockData';

// Backend integration: replace ttvTrendData with API call to /api/analytics/ttv-trend?weeks=12

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-600 text-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div
          key={`tt-${p.name}`}
          className="flex items-center justify-between gap-4"
        >
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-700 tabular-nums text-foreground">
            {p.value} {p.name === 'Completions' ? 'customers' : 'days'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TTVTrendChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-700 text-foreground">
            Time To Value — 12-Week Trend
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Avg days from contract signed to First Value milestone
          </p>
        </div>
        <div className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-md">
          <span className="text-xs font-600">↓ 17 days improvement</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={ttvTrendData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="ttvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            domain={[30, 70]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={52}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            label={{
              value: 'Target 52d',
              position: 'insideTopRight',
              fontSize: 10,
              fill: 'var(--muted-foreground)',
            }}
          />
          <Area
            type="monotone"
            dataKey="avgTTV"
            name="Avg TTV"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#ttvGradient)"
            dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}