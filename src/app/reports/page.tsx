'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { FileText, AlertTriangle, TrendingUp, Download } from 'lucide-react';

const monthlyData = [
  { month: 'Feb', started: 6, completed: 4, atRisk: 1 },
  { month: 'Mar', started: 8, completed: 5, atRisk: 2 },
  { month: 'Apr', started: 7, completed: 6, atRisk: 1 },
  { month: 'May', started: 9, completed: 7, atRisk: 3 },
  { month: 'Jun', started: 11, completed: 8, atRisk: 2 },
  { month: 'Jul', started: 9, completed: 6, atRisk: 3 },
];

const atRiskCustomers = [
  { company: 'NorthBridge Logistics', tier: 'Enterprise', riskScore: 87, issue: 'IT unresponsive 14 days', arr: '$168,000', owner: 'Lena Müller', severity: 'Critical' },
  { company: 'Vantage Capital Partners', tier: 'Enterprise', riskScore: 82, issue: 'Compliance approval pending 18 days', arr: '$320,000', owner: 'Daniel Osei', severity: 'Critical' },
  { company: 'Apex Retail Solutions', tier: 'Mid-Market', riskScore: 71, issue: 'Training blocked — availability unconfirmed', arr: '$96,000', owner: 'Marcus Webb', severity: 'High' },
  { company: 'Starfield Media', tier: 'SMB', riskScore: 68, issue: 'No IT contact — provisioning blocked', arr: '$24,000', owner: 'Daniel Osei', severity: 'High' },
  { company: 'Nexus Property Group', tier: 'Mid-Market', riskScore: 55, issue: 'Training stalled 11 days', arr: '$108,000', owner: 'Aiko Tanaka', severity: 'Medium' },
];

const ttvData = [
  { month: 'Feb', avgTTV: 62, target: 52 },
  { month: 'Mar', avgTTV: 58, target: 52 },
  { month: 'Apr', avgTTV: 55, target: 52 },
  { month: 'May', avgTTV: 51, target: 52 },
  { month: 'Jun', avgTTV: 47, target: 52 },
  { month: 'Jul', avgTTV: 43, target: 52 },
];

const ttvBreakdown = [
  { stage: 'Contract → Kickoff', avgDays: 3.2 },
  { stage: 'Kickoff → Setup', avgDays: 5.8 },
  { stage: 'Setup → Config', avgDays: 11.4 },
  { stage: 'Config → Training', avgDays: 9.1 },
  { stage: 'Training → First Login', avgDays: 2.3 },
  { stage: 'First Login → First Value', avgDays: 14.7 },
];

const severityColors: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-amber-100 text-amber-700',
  Medium: 'bg-yellow-100 text-yellow-700',
};

type ReportTab = 'monthly' | 'atrisk' | 'ttv';

// CSV export helpers
function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportMonthlyCSV() {
  const headers = ['Month', 'Onboardings Started', 'Onboardings Completed', 'At Risk'];
  const rows = monthlyData.map(d => [d.month, String(d.started), String(d.completed), String(d.atRisk)]);
  downloadCSV('monthly-onboarding-summary.csv', [headers, ...rows]);
}

function exportAtRiskCSV() {
  const headers = ['Customer', 'Tier', 'Risk Score', 'Issue', 'ARR at Risk', 'Owner', 'Severity'];
  const rows = atRiskCustomers.map(d => [d.company, d.tier, String(d.riskScore), d.issue, d.arr, d.owner, d.severity]);
  downloadCSV('at-risk-customers.csv', [headers, ...rows]);
}

function exportTTVCSV() {
  const headers = ['Stage', 'Avg Days'];
  const rows = ttvBreakdown.map(d => [d.stage, String(d.avgDays)]);
  downloadCSV('time-to-value-analysis.csv', [headers, ...rows]);
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('monthly');

  const tabs: { id: ReportTab; label: string; icon: React.ReactNode; onExport: () => void }[] = [
    { id: 'monthly', label: 'Monthly Onboarding Summary', icon: <FileText size={14} />, onExport: exportMonthlyCSV },
    { id: 'atrisk', label: 'At-Risk Customer Report', icon: <AlertTriangle size={14} />, onExport: exportAtRiskCSV },
    { id: 'ttv', label: 'Time-to-Value Analysis', icon: <TrendingUp size={14} />, onExport: exportTTVCSV },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <AppLayout title="Reports" subtitle="Pre-built operational reports · July 2026">
      <div className="space-y-6">
        {/* Tab nav */}
        <div className="flex gap-2 flex-wrap border-b border-border pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-600 transition-all duration-150 ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <button
            onClick={activeTabData?.onExport}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-600 bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Monthly Onboarding Summary */}
        {activeTab === 'monthly' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Onboardings Started', value: '9', sub: 'Jul 2026', color: 'text-blue-600' },
                { label: 'Onboardings Completed', value: '6', sub: 'Go Live reached', color: 'text-green-600' },
                { label: 'Completion Rate', value: '67%', sub: 'vs 72% last month', color: 'text-foreground' },
                { label: 'At-Risk Customers', value: '5', sub: '↑2 from June', color: 'text-red-600' },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-800 tabular-nums mt-1 ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-700 text-foreground">Monthly Onboarding Activity (Feb–Jul 2026)</h3>
                <button onClick={exportMonthlyCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 bg-muted text-muted-foreground hover:text-foreground transition-all">
                  <Download size={12} /> Export CSV
                </button>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="started" name="Started" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#16A34A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="atRisk" name="At Risk" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* At-Risk Customer Report */}
        {activeTab === 'atrisk' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Total ARR at Risk', value: '$716K', sub: 'across 5 customers', color: 'text-red-600' },
                { label: 'Critical Risk', value: '2', sub: 'immediate action required', color: 'text-red-600' },
                { label: 'High Risk', value: '2', sub: 'intervention needed', color: 'text-amber-600' },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-800 tabular-nums mt-1 ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-700 text-foreground">At-Risk Customer Detail</h3>
                <button onClick={exportAtRiskCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 bg-muted text-muted-foreground hover:text-foreground transition-all">
                  <Download size={12} /> Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {['Customer', 'Tier', 'Risk Score', 'Issue', 'ARR at Risk', 'Owner', 'Severity'].map(h => (
                        <th key={h} className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {atRiskCustomers.map((row, i) => (
                      <tr key={row.company} className={`border-b border-border last:border-0 hover:bg-muted/40 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                        <td className="px-5 py-3 text-xs font-600 text-foreground whitespace-nowrap">{row.company}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{row.tier}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-700 tabular-nums text-red-600">{row.riskScore}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-foreground max-w-xs">{row.issue}</td>
                        <td className="px-5 py-3 text-xs font-700 tabular-nums text-foreground">{row.arr}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{row.owner}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-600 px-2 py-0.5 rounded-md ${severityColors[row.severity]}`}>{row.severity}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Time-to-Value Analysis */}
        {activeTab === 'ttv' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Current Avg TTV', value: '43d', sub: 'Jul 2026', color: 'text-green-600' },
                { label: 'Target TTV', value: '52d', sub: 'annual target', color: 'text-foreground' },
                { label: 'Improvement YTD', value: '−19d', sub: 'vs Feb 2026 baseline', color: 'text-green-600' },
                { label: 'Longest Stage', value: '14.7d', sub: 'First Login → First Value', color: 'text-amber-600' },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-800 tabular-nums mt-1 ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-700 text-foreground">TTV Trend vs Target (Feb–Jul 2026)</h3>
                  <button onClick={exportTTVCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 bg-muted text-muted-foreground hover:text-foreground transition-all">
                    <Download size={12} /> Export CSV
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={ttvData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} domain={[30, 70]} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="avgTTV" name="Avg TTV (days)" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="target" name="Target (52d)" stroke="#DC2626" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-700 text-foreground">Avg Days per Stage</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ttvBreakdown} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }} />
                    <Bar dataKey="avgDays" name="Avg Days" fill="var(--primary)" radius={[0, 4, 4, 0]} maxBarSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
