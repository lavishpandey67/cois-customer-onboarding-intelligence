import React from 'react';
import { Activity, Flag, CheckSquare, AlertTriangle, MessageSquare } from 'lucide-react';
import { activityFeed } from '@/lib/mockData';
import type { ActivityItem } from '@/lib/mockData';

// Backend integration: replace with /api/activity-feed?limit=7

const typeConfig: Record<
  ActivityItem['type'],
  { icon: React.ReactNode; color: string }
> = {
  milestone: { icon: <Flag size={12} />, color: 'text-green-600 bg-green-100' },
  task: { icon: <CheckSquare size={12} />, color: 'text-blue-600 bg-blue-100' },
  escalation: {
    icon: <AlertTriangle size={12} />,
    color: 'text-red-600 bg-red-100',
  },
  note: {
    icon: <MessageSquare size={12} />,
    color: 'text-muted-foreground bg-muted',
  },
  risk: {
    icon: <AlertTriangle size={12} />,
    color: 'text-amber-600 bg-amber-100',
  },
};

function formatTime(ts: string): string {
  const date = new Date(ts);
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return `${hour}:${m} ${ampm}`;
  return `Jul ${date.getDate()}`;
}

export default function ActivityFeedPanel() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Activity size={15} className="text-muted-foreground" />
        <h3 className="text-sm font-700 text-foreground">Recent Activity</h3>
      </div>
      <div className="p-4 space-y-3">
        {activityFeed.map((item) => {
          const config = typeConfig[item.type];
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${config.color}`}
              >
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-snug">
                  <span className="font-600">{item.actor}</span>{' '}
                  <span className="text-muted-foreground">{item.action}</span>
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {item.target}
                </p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0 tabular-nums">
                {formatTime(item.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}