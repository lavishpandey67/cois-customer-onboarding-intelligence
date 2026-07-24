'use client';

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Calendar,
  DollarSign,
  Users,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Activity,
  FileText,
  Mail,
  MessageSquare,
} from 'lucide-react';
import type { Customer } from '@/lib/mockData';
import HealthScoreBadge from '@/components/ui/HealthScoreBadge';
import StageBadge from '@/components/ui/StageBadge';
import Badge from '@/components/ui/Badge';

interface CustomerDrawerProps {
  customer: Customer;
  onClose: () => void;
}

type TabKey = 'overview' | 'timeline' | 'tasks' | 'ai';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'ai', label: 'AI Insights' },
];

const milestones = [
  { id: 'ms-1', label: 'Contract Signed', done: true, date: 'Jun 10' },
  { id: 'ms-2', label: 'Kickoff Meeting', done: true, date: 'Jun 17' },
  { id: 'ms-3', label: 'Account Setup', done: true, date: 'Jun 24' },
  { id: 'ms-4', label: 'Configuration', done: false, date: 'Jul 15' },
  { id: 'ms-5', label: 'Training', done: false, date: 'Jul 28' },
  { id: 'ms-6', label: 'First Login', done: false, date: 'Aug 4' },
  { id: 'ms-7', label: 'First Value', done: false, date: 'Aug 11' },
  { id: 'ms-8', label: 'Go Live', done: false, date: 'Aug 15' },
  { id: 'ms-9', label: 'Success Handoff', done: false, date: 'Aug 22' },
];

export default function CustomerDrawer({ customer, onClose }: CustomerDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const tierVariant: Record<string, 'enterprise' | 'mid-market' | 'smb'> = {
    Enterprise: 'enterprise',
    'Mid-Market': 'mid-market',
    SMB: 'smb',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-card border-l border-border h-full flex flex-col shadow-2xl fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-700 text-foreground truncate">
                {customer.company}
              </h2>
              <Badge variant={tierVariant[customer.tier]}>{customer.tier}</Badge>
              <StageBadge stage={customer.stage} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {customer.industry} · {customer.region}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
          >
            <X size={16} />
          </button>
        </div>

        {/* Health + progress summary */}
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex-shrink-0">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Health Score</p>
              <HealthScoreBadge
                score={customer.healthScore}
                band={customer.healthBand}
                showBar
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Progress</p>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${customer.progress}%` }}
                  />
                </div>
                <span className="text-xs font-700 tabular-nums text-foreground">
                  {customer.progress}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Risk</p>
              <Badge
                variant={
                  customer.riskLevel === 'Critical' ?'critical'
                    : customer.riskLevel === 'High' ?'high'
                    : customer.riskLevel === 'Medium' ?'medium' :'low'
                }
              >
                {customer.riskLevel}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Days in Stage</p>
              <span
                className={`text-sm font-700 tabular-nums ${
                  customer.daysInStage >= 14
                    ? 'text-red-600'
                    : customer.daysInStage >= 8
                    ? 'text-amber-600' :'text-foreground'
                }`}
              >
                {customer.daysInStage}d
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={`drawer-tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`text-xs font-600 px-3 py-3 border-b-2 transition-all duration-150 ${
                activeTab === tab.key
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-5">
              {/* Key details */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    id: 'detail-value',
                    icon: <DollarSign size={14} />,
                    label: 'Contract Value',
                    value: `$${customer.contractValue.toLocaleString()} ARR`,
                  },
                  {
                    id: 'detail-employees',
                    icon: <Users size={14} />,
                    label: 'Employees',
                    value: customer.employees,
                  },
                  {
                    id: 'detail-region',
                    icon: <Globe size={14} />,
                    label: 'Region',
                    value: customer.region,
                  },
                  {
                    id: 'detail-owner',
                    icon: <Activity size={14} />,
                    label: 'Account Owner',
                    value: customer.accountOwner,
                  },
                  {
                    id: 'detail-start',
                    icon: <Calendar size={14} />,
                    label: 'Onboarding Start',
                    value: customer.startDate,
                  },
                  {
                    id: 'detail-golive',
                    icon: <Clock size={14} />,
                    label: 'Expected Go Live',
                    value: customer.expectedGoLive,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="bg-muted/40 rounded-lg p-3 flex items-start gap-2"
                  >
                    <span className="text-muted-foreground mt-0.5 flex-shrink-0">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-xs font-600 text-foreground mt-0.5">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Assigned manager */}
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">
                  Assigned Manager
                </p>
                <div className="flex items-center gap-3 bg-muted/40 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-700 flex items-center justify-center">
                    {customer.managerInitials}
                  </div>
                  <div>
                    <p className="text-sm font-600 text-foreground">
                      {customer.manager}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Customer Success Manager
                    </p>
                  </div>
                  <button className="ml-auto text-xs text-primary font-600 hover:underline flex items-center gap-1">
                    Message <Mail size={11} />
                  </button>
                </div>
              </div>

              {/* Recent notes */}
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">
                  Recent Notes
                </p>
                <div className="space-y-2">
                  {[
                    {
                      id: 'note-1',
                      author: customer.manager,
                      text: 'Customer confirmed availability for next training session. IT team engaged.',
                      date: 'Jul 22',
                    },
                    {
                      id: 'note-2',
                      author: customer.manager,
                      text: 'Reviewed configuration requirements — 3 custom fields needed.',
                      date: 'Jul 18',
                    },
                  ].map((note) => (
                    <div
                      key={note.id}
                      className="bg-muted/40 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-600 text-foreground">
                          {note.author}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {note.date}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {note.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="p-6">
              <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-4">
                Onboarding Journey
              </p>
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {milestones.map((ms) => (
                    <div key={ms.id} className="flex items-start gap-4 relative">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 ${
                          ms.done
                            ? 'bg-green-500 border-green-500'
                            : ms.label === customer.stage
                            ? 'bg-primary border-primary' :'bg-card border-border'
                        }`}
                      >
                        {ms.done ? (
                          <CheckCircle2 size={13} className="text-white" />
                        ) : ms.label === customer.stage ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs font-600 ${
                              ms.done
                                ? 'text-green-700'
                                : ms.label === customer.stage
                                ? 'text-primary' :'text-muted-foreground'
                            }`}
                          >
                            {ms.label}
                            {ms.label === customer.stage && (
                              <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                                Current
                              </span>
                            )}
                          </p>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {ms.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="p-6">
              <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-3">
                Active Tasks
              </p>
              <div className="space-y-2">
                {[
                  {
                    id: 'dt-1',
                    title: 'Complete SSO configuration',
                    status: 'In Progress',
                    due: 'Jul 26',
                    priority: 'High',
                  },
                  {
                    id: 'dt-2',
                    title: 'Security review sign-off',
                    status: 'Blocked',
                    due: 'Jul 24',
                    priority: 'Critical',
                  },
                  {
                    id: 'dt-3',
                    title: 'User provisioning — admin accounts',
                    status: 'Backlog',
                    due: 'Jul 30',
                    priority: 'Medium',
                  },
                ].map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 bg-muted/40 rounded-lg p-3"
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.status === 'Blocked' ?'bg-red-500'
                          : task.status === 'In Progress' ?'bg-primary' :'bg-muted-foreground'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-600 text-foreground truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Due {task.due}
                      </p>
                    </div>
                    <Badge
                      variant={
                        task.priority === 'Critical' ?'critical'
                          : task.priority === 'High' ?'high' :'medium'
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-primary" />
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider">
                  AI-Generated Recommendations
                </p>
              </div>
              {[
                {
                  id: 'ai-rec-1',
                  type: 'risk' as const,
                  title: 'Escalation recommended',
                  body: `${customer.company} has been in ${customer.stage} for ${customer.daysInStage} days. Based on similar ${customer.tier} customers, this exceeds the expected duration by 40%. Immediate stakeholder outreach recommended.`,
                },
                {
                  id: 'ai-rec-2',
                  type: 'action' as const,
                  title: 'Suggested next action',
                  body: `Schedule a 30-minute alignment call with ${customer.manager} and customer IT lead to unblock configuration dependencies. Use the ${customer.industry} onboarding playbook template.`,
                },
                {
                  id: 'ai-rec-3',
                  type: 'opportunity' as const,
                  title: 'Expansion signal detected',
                  body: `${customer.company}'s usage pattern and team size (${customer.employees}) suggest they may benefit from the Advanced Analytics add-on. Flag for account expansion review post Go Live.`,
                },
              ].map((rec) => {
                const colors = {
                  risk: 'bg-red-50 border-red-200 text-red-700',
                  action: 'bg-blue-50 border-blue-200 text-blue-700',
                  opportunity: 'bg-green-50 border-green-200 text-green-700',
                };
                const icons = {
                  risk: <AlertTriangle size={13} />,
                  action: <CheckCircle2 size={13} />,
                  opportunity: <Activity size={13} />,
                };
                return (
                  <div
                    key={rec.id}
                    className={`rounded-lg border p-4 ${colors[rec.type]}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {icons[rec.type]}
                      <p className="text-xs font-700">{rec.title}</p>
                    </div>
                    <p className="text-xs leading-relaxed opacity-80">{rec.body}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-border px-6 py-4 flex items-center gap-3 flex-shrink-0 bg-muted/20">
          <button className="flex-1 bg-primary text-primary-foreground text-xs font-600 px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <ExternalLink size={13} />
            Open Full Profile
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-border text-xs font-600 text-secondary-foreground hover:bg-muted transition-colors flex items-center gap-2">
            <MessageSquare size={13} />
            Add Note
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-border text-xs font-600 text-secondary-foreground hover:bg-muted transition-colors flex items-center gap-2">
            <FileText size={13} />
            AI Summary
          </button>
        </div>
      </div>
    </div>
  );
}