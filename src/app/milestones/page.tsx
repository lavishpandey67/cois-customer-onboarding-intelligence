'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Flag, TrendingUp, Users, Clock } from 'lucide-react';
import { fetchMilestones } from '@/lib/supabase/dataService';
import type { MilestoneRow } from '@/lib/supabase/dataService';

const statusConfig = {
  'on-track': { label: 'On Track', cls: 'bg-green-100 text-green-700' },
  'at-risk': { label: 'At Risk', cls: 'bg-amber-100 text-amber-700' },
  'delayed': { label: 'Delayed', cls: 'bg-red-100 text-red-700' },
};

export default function MilestonesPage() {
  const [milestoneData, setMilestoneData] = useState<MilestoneRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMilestones().then((data) => {
      setMilestoneData(data);
      setLoading(false);
    });
  }, []);

  const totalCompleted = milestoneData.reduce((s, m) => s + m.completed, 0);
  const avgRate = milestoneData.length > 0
    ? Math.round(milestoneData.reduce((s, m) => s + m.completionRate, 0) / milestoneData.length)
    : 0;

  return (
    <AppLayout title="Milestones" subtitle="Completion rates, stage durations, and active customer distribution">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading milestones…</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Milestone Completions', value: totalCompleted, icon: <Flag size={16} className="text-primary" />, sub: 'across all stages' },
              { label: 'Avg Completion Rate', value: `${avgRate}%`, icon: <TrendingUp size={16} className="text-green-600" />, sub: 'across 9 stages' },
              { label: 'Active Customers', value: 50, icon: <Users size={16} className="text-blue-600" />, sub: 'in onboarding' },
              { label: 'Avg Stage Duration', value: '6.3d', icon: <Clock size={16} className="text-amber-600" />, sub: 'vs 6.0d target' },
            ].map(card => (
              <div key={card.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">{card.icon}<span className="text-xs text-muted-foreground">{card.label}</span></div>
                <p className="text-2xl font-800 text-foreground tabular-nums">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Milestones table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-700 text-foreground">Milestone Stage Overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">All 9 onboarding stages · completion rates and timing</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Milestone', 'Completion Rate', 'Avg Days', 'Target', 'Variance', 'Active Customers', 'Status'].map(h => (
                      <th key={h} className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {milestoneData.map((row, i) => {
                    const variance = row.avgDays - row.targetDays;
                    const sc = statusConfig[row.status];
                    return (
                      <tr key={row.name} className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center flex-shrink-0">{i + 1}</div>
                            <span className="text-xs font-600 text-foreground whitespace-nowrap">{row.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-1.5 w-20">
                              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${row.completionRate}%` }} />
                            </div>
                            <span className="text-xs font-700 tabular-nums text-foreground">{row.completionRate}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3"><span className="text-xs font-600 tabular-nums text-foreground">{row.avgDays > 0 ? `${row.avgDays}d` : '—'}</span></td>
                        <td className="px-5 py-3"><span className="text-xs text-muted-foreground tabular-nums">{row.targetDays > 0 ? `${row.targetDays}d` : '—'}</span></td>
                        <td className="px-5 py-3">
                          {row.avgDays > 0 ? (
                            <span className={`text-xs font-600 tabular-nums ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {variance > 0 ? `+${variance.toFixed(1)}d` : `${variance.toFixed(1)}d`}
                            </span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-5 py-3">
                          {row.currentCustomers.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {row.currentCustomers.slice(0, 3).map(c => (
                                <span key={c} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{c.split(' ')[0]}</span>
                              ))}
                              {row.currentCustomers.length > 3 && (
                                <span className="text-xs text-muted-foreground">+{row.currentCustomers.length - 3}</span>
                              )}
                            </div>
                          ) : <span className="text-xs text-muted-foreground">All completed</span>}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-600 px-2 py-0.5 rounded-md ${sc.cls}`}>{sc.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
