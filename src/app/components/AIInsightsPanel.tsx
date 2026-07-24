import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
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

export default function AIInsightsPanel() {
  return (
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
          return (
            <div
              key={insight.id}
              className={`rounded-lg border p-3 ${config.bg} cursor-pointer hover:shadow-sm transition-all duration-150`}
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
                    </span>
                    <button className="text-xs text-primary font-600 flex items-center gap-0.5 hover:underline">
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
  );
}