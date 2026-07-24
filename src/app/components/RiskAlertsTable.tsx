import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { riskAlerts } from '@/lib/mockData';
import Badge from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';

// Backend integration: replace with /api/risk-alerts?severity=high,critical

const severityBadge: Record<string, BadgeVariant> = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
};

export default function RiskAlertsTable() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <h3 className="text-sm font-700 text-foreground">Risk Alerts</h3>
          <span className="bg-red-100 text-red-700 text-xs font-600 px-1.5 py-0.5 rounded-md tabular-nums">
            {riskAlerts.length} active
          </span>
        </div>
        <button className="text-xs text-primary font-600 hover:underline flex items-center gap-1">
          View all <ExternalLink size={11} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-5 py-3">
                Customer
              </th>
              <th className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-3 py-3">
                Issue
              </th>
              <th className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-3 py-3">
                Severity
              </th>
              <th className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-3 py-3">
                Inactive
              </th>
              <th className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-3 py-3">
                ARR at Risk
              </th>
              <th className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-3 py-3">
                Owner
              </th>
            </tr>
          </thead>
          <tbody>
            {riskAlerts.map((alert, i) => (
              <tr
                key={alert.id}
                className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100 ${
                  i % 2 === 0 ? '' : 'bg-muted/20'
                }`}
              >
                <td className="px-5 py-3">
                  <div>
                    <p className="font-600 text-foreground text-xs leading-tight">
                      {alert.company}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {alert.tier}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-3 max-w-xs">
                  <p className="text-xs text-foreground leading-relaxed">
                    {alert.issue}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <Badge
                    variant={
                      severityBadge[alert.severity] as BadgeVariant
                    }
                  >
                    {alert.severity}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`text-xs font-600 tabular-nums ${
                      alert.daysSinceLastActivity >= 10
                        ? 'text-red-600' :'text-amber-600'
                    }`}
                  >
                    {alert.daysSinceLastActivity}d
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs font-700 tabular-nums text-foreground">
                    ${alert.revenueAtRisk.toLocaleString()}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center">
                      {alert.manager
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {alert.manager.split(' ')[0]}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}