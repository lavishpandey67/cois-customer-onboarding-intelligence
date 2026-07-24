'use client';

import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ChevronRight, X, CheckCircle } from 'lucide-react';
import { aiInsights } from '@/lib/mockData';
import type { AIInsight } from '@/lib/mockData';

// Backend integration: replace with /api/ai/insights?limit=3

const typeConfig: Record<
  AIInsight['type'],
  { icon: React.ReactNode; color: string; bg: string }
> = {
  risk: {
    icon: <AlertTriangle size={13} />,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
  },
  opportunity: {
    icon: <TrendingUp size={13} />,
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
  },
  action: {
    icon: <Lightbulb size={13} />,
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
};

const insightDetails: Record<string, {
  affectedCustomerNames: string[];
  actions: string[];
}> = {
  'insight-001': {
    affectedCustomerNames: ['NorthBridge Logistics', 'Vantage Capital Partners', 'Starfield Media'],
    actions: [
      'Schedule executive escalation calls for NorthBridge and Vantage Capital within 24 hours',
      'Send formal delay notices to all three customers with revised Go Live timelines',
      'Assign dedicated escalation owners and set daily check-in cadence until resolved',
    ],
  },
  'insight-002': {
    affectedCustomerNames: ['Cascade Insurance Group'],
    actions: [
      'Schedule expansion discovery call during the Go Live handoff meeting this week',
      'Prepare a tailored expansion proposal based on their usage patterns and team size',
      'Loop in Account Executive to co-lead the expansion conversation',
    ],
  },
  'insight-003': {
    affectedCustomerNames: ['Apex Retail Solutions', 'Nexus Property Group', 'Ironclad Manufacturing', 'BlueSky Pharma', 'Starfield Media', 'Orion Logistics', 'Pinnacle Consulting', 'Redwood Analytics'],
    actions: [
      'Deploy the Solaris Training Template across all 8 active Mid-Market onboardings immediately',
      'Brief all CS Managers on the structured training module format in the next team standup',
      'Track training stage duration weekly to validate the 34% reduction target',
    ],
  },
};

interface InsightModalProps {
  insight: AIInsight;
  onClose: () => void;
  onMarkReviewed: () => void;
  reviewed: boolean;
}

function InsightModal({ insight, onClose, onMarkReviewed, reviewed }: InsightModalProps) {
  const config = typeConfig[insight.type];
  const details = insightDetails[insight.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-start justify-between p-5 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5`}>
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className={`${config.color} mt-0.5 flex-shrink-0`}>{config.icon}</span>
            <div>
              <p className="text-sm font-700 text-foreground leading-tight">{insight.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-600 px-2 py-0.5 rounded-md border ${config.bg} ${config.color}`}>
                  {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                </span>
                <span className="text-xs text-muted-foreground">{insight.impact} Impact</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-2">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Full analysis */}
          <div>
            <h4 className="text-xs font-700 text-foreground uppercase tracking-wider mb-2">Full Analysis</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
          </div>

          {/* Affected customers */}
          <div>
            <h4 className="text-xs font-700 text-foreground uppercase tracking-wider mb-2">
              Affected Customers ({details.affectedCustomerNames.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {details.affectedCustomerNames.map(name => (
                <span key={name} className="text-xs bg-muted text-foreground px-2.5 py-1 rounded-lg font-500">{name}</span>
              ))}
            </div>
          </div>

          {/* Recommended actions */}
          <div>
            <h4 className="text-xs font-700 text-foreground uppercase tracking-wider mb-2">Recommended Actions</h4>
            <ul className="space-y-2">
              {details.actions.map((action, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-foreground leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-between gap-3">
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Close
          </button>
          <button
            onClick={onMarkReviewed}
            disabled={reviewed}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-600 transition-all duration-150 ${
              reviewed
                ? 'bg-green-100 text-green-700 cursor-default' :'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <CheckCircle size={13} />
            {reviewed ? 'Marked as Reviewed' : 'Mark as Reviewed'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AIInsightsPanel() {
  const [activeInsight, setActiveInsight] = useState<AIInsight | null>(null);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-primary" />
            <h3 className="text-sm font-700 text-foreground">AI Insights</h3>
            <span className="text-xs text-muted-foreground">· Generated 04:14 AM</span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {aiInsights.map((insight) => {
            const config = typeConfig[insight.type];
            const isReviewed = reviewed.has(insight.id);
            return (
              <div
                key={insight.id}
                className={`rounded-lg border p-3 ${config.bg} cursor-pointer hover:shadow-sm transition-all duration-150 ${isReviewed ? 'opacity-60' : ''}`}
                onClick={() => setActiveInsight(insight)}
              >
                <div className="flex items-start gap-2">
                  <span className={`${config.color} mt-0.5 flex-shrink-0`}>
                    {config.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-700 text-foreground leading-tight mb-1">
                      {insight.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {insight.affectedCustomers} customer
                        {insight.affectedCustomers > 1 ? 's' : ''} affected
                        {isReviewed && <span className="ml-2 text-green-600 font-600">· Reviewed</span>}
                      </span>
                      <button
                        className="text-xs text-primary font-600 flex items-center gap-0.5 hover:underline"
                        onClick={e => { e.stopPropagation(); setActiveInsight(insight); }}
                      >
                        View <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeInsight && (
        <InsightModal
          insight={activeInsight}
          onClose={() => setActiveInsight(null)}
          onMarkReviewed={() => {
            setReviewed(prev => new Set([...prev, activeInsight.id]));
            setActiveInsight(null);
          }}
          reviewed={reviewed.has(activeInsight.id)}
        />
      )}
    </>
  );
}