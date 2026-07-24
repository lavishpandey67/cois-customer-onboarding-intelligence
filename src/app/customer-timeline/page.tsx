'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { AlertTriangle, CheckCircle2, Clock, Flag, Filter } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  customer: string;
  tier: 'Enterprise' | 'Mid-Market' | 'SMB';
  eventType: 'milestone' | 'risk' | 'task' | 'update';
  title: string;
  description: string;
  manager: string;
  managerInitials: string;
}

const timelineEvents: TimelineEvent[] = [
  { id: 'te-001', date: 'Jul 24, 2026', time: '09:14 AM', customer: 'Solaris Health Systems', tier: 'Enterprise', eventType: 'milestone', title: 'First Login Completed', description: 'All 12 primary users completed first login. Platform adoption rate at 91%.', manager: 'Priya Nair', managerInitials: 'PN' },
  { id: 'te-002', date: 'Jul 24, 2026', time: '08:52 AM', customer: 'Quantum Dynamics Corp', tier: 'Mid-Market', eventType: 'task', title: 'UAT Sign-off Received', description: 'User acceptance testing completed successfully. Moving to First Value milestone.', manager: 'Jordan Ellis', managerInitials: 'JE' },
  { id: 'te-003', date: 'Jul 23, 2026', time: '05:30 PM', customer: 'Vantage Capital Partners', tier: 'Enterprise', eventType: 'risk', title: 'Security Review Escalated', description: 'Compliance approval pending 18 days. Go Live at risk. Executive intervention required.', manager: 'Daniel Osei', managerInitials: 'DO' },
  { id: 'te-004', date: 'Jul 23, 2026', time: '03:20 PM', customer: 'Apex Retail Solutions', tier: 'Mid-Market', eventType: 'update', title: 'Training Delay Noted', description: 'Customer availability not confirmed for scheduled training sessions. Rescheduling in progress.', manager: 'Marcus Webb', managerInitials: 'MW' },
  { id: 'te-005', date: 'Jul 23, 2026', time: '02:05 PM', customer: 'NorthBridge Logistics', tier: 'Enterprise', eventType: 'risk', title: 'IT Contact Unresponsive', description: 'No response from IT team for 14 days. Account provisioning blocked. Risk flag raised.', manager: 'Lena Müller', managerInitials: 'LM' },
  { id: 'te-006', date: 'Jul 23, 2026', time: '11:40 AM', customer: 'Meridian Financial Group', tier: 'Enterprise', eventType: 'milestone', title: 'Configuration Completed', description: 'Full platform configuration signed off. Moving to Training stage.', manager: 'Sarah Chen', managerInitials: 'SC' },
  { id: 'te-007', date: 'Jul 23, 2026', time: '10:15 AM', customer: 'BlueSky Pharma', tier: 'Mid-Market', eventType: 'task', title: 'Compliance Docs Updated', description: 'Compliance documentation updated to 55% completion. Target: 100% by Jul 28.', manager: 'Ryan Castillo', managerInitials: 'RC' },
  { id: 'te-008', date: 'Jul 22, 2026', time: '04:00 PM', customer: 'Cascade Insurance Group', tier: 'Enterprise', eventType: 'milestone', title: 'Go Live Approved', description: 'All pre-launch checks passed. Go Live scheduled for Jul 26, 2026.', manager: 'Sarah Chen', managerInitials: 'SC' },
  { id: 'te-009', date: 'Jul 22, 2026', time: '02:30 PM', customer: 'Starfield Media', tier: 'SMB', eventType: 'risk', title: 'Account Provisioning Blocked', description: 'No IT contact provided. Account setup cannot proceed without technical point of contact.', manager: 'Daniel Osei', managerInitials: 'DO' },
  { id: 'te-010', date: 'Jul 22, 2026', time: '10:00 AM', customer: 'Nexus Property Group', tier: 'Mid-Market', eventType: 'update', title: 'Training Stage Stalled', description: '11 days in Training stage with no progress update. Manager follow-up scheduled.', manager: 'Aiko Tanaka', managerInitials: 'AT' },
  { id: 'te-011', date: 'Jul 21, 2026', time: '03:45 PM', customer: 'Ironclad Manufacturing', tier: 'Mid-Market', eventType: 'milestone', title: 'Kickoff Meeting Completed', description: 'Kickoff meeting held with 8 stakeholders. Project charter signed. Account setup initiated.', manager: 'Chris Nakamura', managerInitials: 'CN' },
  { id: 'te-012', date: 'Jul 21, 2026', time: '11:20 AM', customer: 'Pinnacle Consulting Group', tier: 'SMB', eventType: 'milestone', title: 'Contract Signed', description: 'MSA and SOW executed. Onboarding kickoff scheduled for Jul 28, 2026.', manager: 'Fatima Al-Rashid', managerInitials: 'FA' },
];

const eventConfig = {
  milestone: { icon: <CheckCircle2 size={14} />, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200', label: 'Milestone' },
  risk: { icon: <AlertTriangle size={14} />, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200', label: 'Risk Flag' },
  task: { icon: <Flag size={14} />, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', label: 'Task Update' },
  update: { icon: <Clock size={14} />, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200', label: 'Update' },
};

const tierColors: Record<string, string> = {
  Enterprise: 'bg-purple-100 text-purple-700',
  'Mid-Market': 'bg-blue-100 text-blue-700',
  SMB: 'bg-gray-100 text-gray-600',
};

export default function CustomerTimelinePage() {
  const [filter, setFilter] = useState<'all' | 'milestone' | 'risk' | 'task' | 'update'>('all');

  const filtered = filter === 'all' ? timelineEvents : timelineEvents.filter(e => e.eventType === filter);

  const grouped = filtered.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  return (
    <AppLayout title="Customer Timeline" subtitle="Onboarding activity across all customers · sorted by date">
      <div className="space-y-6">
        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-muted-foreground" />
          {(['all', 'milestone', 'risk', 'task', 'update'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-600 transition-all duration-150 capitalize ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All Events' : eventConfig[f].label}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} events</span>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, events]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-700 text-muted-foreground uppercase tracking-wider px-3 py-1 bg-muted rounded-full">{date}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {events.map(event => {
                    const cfg = eventConfig[event.eventType];
                    return (
                      <div key={event.id} className="relative flex gap-4 pl-12">
                        <div className={`absolute left-3 top-3 w-5 h-5 rounded-full border-2 border-card flex items-center justify-center ${cfg.bg} ${cfg.color} flex-shrink-0 z-10`}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow duration-150">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-600 px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{cfg.label}</span>
                              <span className={`text-xs font-600 px-2 py-0.5 rounded-md ${tierColors[event.tier]}`}>{event.tier}</span>
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums">{event.time}</span>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm font-700 text-foreground">{event.customer}</p>
                            <p className="text-xs font-600 text-foreground mt-0.5">{event.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{event.description}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center">{event.managerInitials}</div>
                            <span className="text-xs text-muted-foreground">{event.manager}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
