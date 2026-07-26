'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, Legend } from 'recharts';
import PDFExportButton from '@/components/PDFExportButton';

const stageData = [
  { stage: 'Contract Signed', count: 3 },
  { stage: 'Kickoff', count: 4 },
  { stage: 'Account Setup', count: 6 },
  { stage: 'Configuration', count: 9 },
  { stage: 'Training', count: 11 },
  { stage: 'First Login', count: 7 },
  { stage: 'First Value', count: 5 },
  { stage: 'Go Live', count: 3 },
  { stage: 'Handoff', count: 2 },
];

const stageColors = ['#6366F1','#8B5CF6','#0EA5E9','#0284C7','#059669','#16A34A','#65A30D','#1D4ED8','#0F172A'];

const healthTrendData = [
  { week: 'W14', excellent: 8, good: 16, fair: 14, poor: 12 },
  { week: 'W16', excellent: 9, good: 17, fair: 13, poor: 11 },
  { week: 'W18', excellent: 10, good: 18, fair: 12, poor: 10 },
  { week: 'W20', excellent: 11, good: 18, fair: 12, poor: 9 },
  { week: 'W22', excellent: 11, good: 18, fair: 12, poor: 9 },
  { week: 'W24', excellent: 12, good: 18, fair: 11, poor: 9 },
  { week: 'W25', excellent: 12, good: 18, fair: 11, poor: 9 },
];

const churnRiskData = [
  { name: 'Enterprise', low: 8, medium: 5, high: 4, critical: 3 },
  { name: 'Mid-Market', low: 9, medium: 6, high: 3, critical: 2 },
  { name: 'SMB', low: 4, medium: 3, high: 2, critical: 1 },
];

const cacRevenueData = [
  { channel: 'Direct Sales', cac: 12400, revenue: 284000, customers: 14 },
  { channel: 'Partner', cac: 8200, revenue: 196000, customers: 11 },
  { channel: 'Inbound', cac: 4100, revenue: 88000, customers: 9 },
  { channel: 'Events', cac: 9800, revenue: 142000, customers: 7 },
  { channel: 'Referral', cac: 3200, revenue: 76000, customers: 9 },
];

const tooltipStyle = { fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' };

export default function AnalyticsPage() {
  return (
    <AppLayout title="Analytics" subtitle="Operational intelligence · 50 active customers · Jul 2026">
      <div className="space-y-6">
        {/* Export header */}
        <div className="flex items-center justify-end">
          <PDFExportButton
            targetId="analytics-content"
            filename="cois-analytics-report"
            label="Export Analytics PDF"
          />
        </div>

        <div id="analytics-content">
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stage Distribution */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <h3 className="text-sm font-700 text-foreground">Onboarding Stage Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">50 active customers across 9 stages</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stageData} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Customers" radius={[0, 4, 4, 0]} maxBarSize={16}>
                  {stageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={stageColors[index % stageColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Health Score Trends */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <h3 className="text-sm font-700 text-foreground">Health Score Trends — 12 Weeks</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Customer distribution by health band over time</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={healthTrendData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="excellent" name="Excellent" stroke="#16A34A" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="good" name="Good" stroke="#65A30D" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="fair" name="Fair" stroke="#D97706" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="poor" name="Poor" stroke="#DC2626" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Churn Risk by Tier */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <h3 className="text-sm font-700 text-foreground">Churn Risk by Customer Tier</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Risk level distribution across Enterprise, Mid-Market, SMB</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={churnRiskData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="low" name="Low Risk" fill="#16A34A" stackId="a" />
                <Bar dataKey="medium" name="Medium Risk" fill="#D97706" stackId="a" />
                <Bar dataKey="high" name="High Risk" fill="#EA580C" stackId="a" />
                <Bar dataKey="critical" name="Critical Risk" fill="#DC2626" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CAC vs Revenue by Channel */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <h3 className="text-sm font-700 text-foreground">CAC vs Revenue by Acquisition Channel</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Customer acquisition cost vs total ARR per channel</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cacRevenueData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="channel" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" name="Revenue (ARR)" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cac" name="CAC" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      </div>
    </AppLayout>
  );
}
