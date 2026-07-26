'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ExternalLink, X } from 'lucide-react';
import { fetchRiskAlerts, subscribeToRiskAlerts } from '@/lib/supabase/dataService';
import Badge from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';
import type { RiskAlert } from '@/lib/mockData';

const severityBadge: Record<string, BadgeVariant> = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
};

const suggestedActions: Record<string, string> = {
  'alert-001': 'Escalate to executive sponsor immediately. Send formal delay notice and request IT team introduction within 24 hours.',
  'alert-002': 'Schedule compliance review call with Vantage Capital legal team. Loop in Daniel Osei and request daily status updates.',
  'alert-003': 'Contact Apex Retail primary business contact to confirm training dates. Offer 3 alternative scheduling windows.',
  'alert-004': 'Request IT contact information from Starfield Media business sponsor. Account setup cannot proceed without technical POC.',
  'alert-005': 'Schedule check-in call with Nexus Property Group stakeholders. Identify training blockers and propose revised timeline.',
};

interface RiskDetailModalProps {
  alert: RiskAlert;
  onClose: () => void;
}

function RiskDetailModal({ alert, onClose }: RiskDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-sm font-700 text-foreground">{alert.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{alert.tier}</span>
              <Badge variant={severityBadge[alert.severity] as BadgeVariant}>{alert.severity}</Badge>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Days Inactive</p>
              <p className={`text-xl font-800 tabular-nums mt-0.5 ${alert.daysSinceLastActivity >= 10 ? 'text-red-600' : 'text-amber-600'}`}>
                {alert.daysSinceLastActivity}d
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">ARR at Risk</p>
              <p className="text-xl font-800 tabular-nums mt-0.5 text-foreground">${alert.revenueAtRisk.toLocaleString()}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-700 text-foreground uppercase tracking-wider mb-1.5">Issue Description</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{alert.issue}</p>
          </div>
          <div>
            <p className="text-xs font-700 text-foreground uppercase tracking-wider mb-1.5">Assigned Owner</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center">
                {alert.manager.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-xs font-600 text-foreground">{alert.manager}</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-700 text-foreground uppercase tracking-wider mb-1.5">Suggested Next Action</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{suggestedActions[alert.id] || 'Review customer status and schedule a stakeholder call within 48 hours.'}</p>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-600 hover:bg-primary/90 transition-all duration-150">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RiskAlertsTable() {
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null);

  useEffect(() => {
    fetchRiskAlerts().then((data) => {
      setRiskAlerts(data);
      setLoading(false);
    });
    const unsub = subscribeToRiskAlerts((data) => setRiskAlerts(data));
    return unsub;
  }, []);

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h3 className="text-sm font-700 text-foreground">Risk Alerts</h3>
            {!loading && (
              <span className="bg-red-100 text-red-700 text-xs font-600 px-1.5 py-0.5 rounded-md tabular-nums">
                {riskAlerts.length} active
              </span>
            )}
          </div>
          <button className="text-xs text-primary font-600 hover:underline flex items-center gap-1">
            View all <ExternalLink size={11} />
          </button>
        </div>
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-3 py-3">Issue</th>
                  <th className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-3 py-3">Severity</th>
                  <th className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-3 py-3">Inactive</th>
                  <th className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-3 py-3">ARR at Risk</th>
                  <th className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-3 py-3">Owner</th>
                </tr>
              </thead>
              <tbody>
                {riskAlerts.map((alert, i) => (
                  <tr
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100 cursor-pointer ${i % 2 === 0 ? '' : 'bg-muted/20'}`}
                  >
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-600 text-foreground text-xs leading-tight">{alert.company}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{alert.tier}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 max-w-xs">
                      <p className="text-xs text-foreground leading-relaxed">{alert.issue}</p>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={severityBadge[alert.severity] as BadgeVariant}>{alert.severity}</Badge>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-600 tabular-nums ${alert.daysSinceLastActivity >= 10 ? 'text-red-600' : 'text-amber-600'}`}>
                        {alert.daysSinceLastActivity}d
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-700 tabular-nums text-foreground">${alert.revenueAtRisk.toLocaleString()}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center">
                          {alert.manager.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs text-muted-foreground">{alert.manager.split(' ')[0]}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedAlert && (
        <RiskDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </>
  );
}