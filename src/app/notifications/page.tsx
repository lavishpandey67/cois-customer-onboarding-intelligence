'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell, CheckCheck, AlertTriangle, Flag, CheckCircle2, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'risk' | 'milestone' | 'task' | 'system';
  title: string;
  customer: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
}

const notifications: Notification[] = [
  { id: 'n-001', type: 'risk', title: 'Critical Risk Alert', customer: 'Vantage Capital Partners', description: 'Compliance approval pending 18 days. Go Live at risk. Immediate executive intervention required.', timestamp: '2026-07-24T09:30:00', read: false, actionRequired: true },
  { id: 'n-002', type: 'risk', title: 'IT Contact Unresponsive', customer: 'NorthBridge Logistics', description: 'No response from IT team for 14 days. Account provisioning blocked. Escalation recommended.', timestamp: '2026-07-24T08:45:00', read: false, actionRequired: true },
  { id: 'n-003', type: 'milestone', title: 'Milestone Completed', customer: 'Solaris Health Systems', description: 'First Login milestone completed. All 12 primary users onboarded. Platform adoption at 91%.', timestamp: '2026-07-24T09:14:00', read: false, actionRequired: false },
  { id: 'n-004', type: 'task', title: 'UAT Sign-off Received', customer: 'Quantum Dynamics Corp', description: 'User acceptance testing completed successfully. Customer ready to proceed to First Value stage.', timestamp: '2026-07-24T08:52:00', read: false, actionRequired: false },
  { id: 'n-005', type: 'risk', title: 'Training Blocked', customer: 'Apex Retail Solutions', description: 'Training cannot proceed — customer availability not confirmed. Follow up required by EOD.', timestamp: '2026-07-23T15:20:00', read: false, actionRequired: true },
  { id: 'n-006', type: 'milestone', title: 'Go Live Approved', customer: 'Cascade Insurance Group', description: 'All pre-launch checks passed. Go Live scheduled for Jul 26, 2026. Expansion discovery call recommended.', timestamp: '2026-07-22T16:00:00', read: false, actionRequired: false },
  { id: 'n-007', type: 'task', title: 'Compliance Docs Updated', customer: 'BlueSky Pharma', description: 'Compliance documentation updated to 55% completion. Target: 100% by Jul 28, 2026.', timestamp: '2026-07-23T10:15:00', read: false, actionRequired: false },
  { id: 'n-008', type: 'system', title: 'Weekly AI Summary Ready', customer: 'Portfolio', description: 'Your weekly AI-generated onboarding summary for Jul 14–20 is ready. 3 new risk flags identified.', timestamp: '2026-07-21T07:00:00', read: false, actionRequired: false },
];

const typeConfig = {
  risk: { icon: <AlertTriangle size={14} />, color: 'text-red-600', bg: 'bg-red-100', label: 'Risk Alert' },
  milestone: { icon: <CheckCircle2 size={14} />, color: 'text-green-600', bg: 'bg-green-100', label: 'Milestone' },
  task: { icon: <Flag size={14} />, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Task Update' },
  system: { icon: <Bell size={14} />, color: 'text-purple-600', bg: 'bg-purple-100', label: 'System' },
};

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

export default function NotificationsPage() {
  const [items, setItems] = useState(notifications);
  const unread = items.filter(n => !n.read).length;

  const markRead = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <AppLayout title="Notifications" subtitle={`${unread} unread · Jul 24, 2026`}>
      <div className="space-y-4 max-w-3xl">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-muted-foreground" />
            <span className="text-sm font-600 text-foreground">{unread} unread notifications</span>
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-primary font-600 hover:underline"
          >
            <CheckCheck size={13} />
            Mark all as read
          </button>
        </div>

        {/* Notification list */}
        <div className="space-y-2">
          {items.map(notification => {
            const cfg = typeConfig[notification.type];
            return (
              <div
                key={notification.id}
                className={`bg-card border rounded-xl p-4 transition-all duration-150 hover:shadow-sm cursor-pointer ${
                  notification.read ? 'border-border opacity-70' : 'border-border shadow-sm'
                }`}
                onClick={() => markRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-600 px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                        {notification.actionRequired && (
                          <span className="text-xs font-600 px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200">Action Required</span>
                        )}
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <Clock size={11} />
                        <span>{formatRelativeTime(notification.timestamp)}</span>
                      </div>
                    </div>
                    <p className="text-xs font-700 text-foreground mt-1.5">{notification.title}</p>
                    <p className="text-xs font-600 text-primary mt-0.5">{notification.customer}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notification.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
