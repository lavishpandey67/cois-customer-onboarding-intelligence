'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Link2, Calendar, User, Building2, Flag, CheckCircle2, Clock, Sparkles,  } from 'lucide-react';
import type { Task } from '@/lib/mockData';
import Badge from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const priorityVariant: Record<Task['priority'], BadgeVariant> = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
};

const statusStyles: Record<Task['status'], string> = {
  Blocked: 'bg-red-100 text-red-700 border border-red-200',
  'In Progress': 'bg-blue-100 text-blue-700 border border-blue-200',
  'In Review': 'bg-amber-100 text-amber-700 border border-amber-200',
  Backlog: 'bg-slate-100 text-slate-600 border border-slate-200',
  Completed: 'bg-green-100 text-green-700 border border-green-200',
};

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}, 2026`;
}

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState('');

  const isOverdue =
    new Date(task.dueDate) < new Date('2026-07-24') &&
    task.status !== 'Completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col fade-in">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-600 ${statusStyles[task.status]}`}
              >
                {task.status}
              </span>
              {task.isEscalated && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-600 bg-red-100 text-red-700 border border-red-200">
                  <AlertTriangle size={11} /> Escalated
                </span>
              )}
              {task.hasBlocker && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-600 bg-red-50 text-red-600 border border-red-200">
                  Blocked
                </span>
              )}
            </div>
            <h2 className="text-base font-700 text-foreground leading-snug">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Description */}
            <div>
              <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">
                Description
              </p>
              <p className="text-sm text-foreground leading-relaxed bg-muted/40 rounded-lg p-3">
                {task.description}
              </p>
            </div>

            {/* Key details grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: 'td-customer',
                  icon: <Building2 size={13} />,
                  label: 'Customer',
                  value: task.customerName,
                },
                {
                  id: 'td-owner',
                  icon: <User size={13} />,
                  label: 'Owner',
                  value: task.owner,
                },
                {
                  id: 'td-milestone',
                  icon: <Flag size={13} />,
                  label: 'Milestone',
                  value: task.milestone,
                },
                {
                  id: 'td-created',
                  icon: <Clock size={13} />,
                  label: 'Created',
                  value: formatDate(task.createdAt),
                },
                {
                  id: 'td-due',
                  icon: <Calendar size={13} />,
                  label: 'Due Date',
                  value: formatDate(task.dueDate),
                  highlight: isOverdue,
                },
                {
                  id: 'td-progress',
                  icon: <CheckCircle2 size={13} />,
                  label: 'Progress',
                  value: `${task.progress}%`,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2 bg-muted/40 rounded-lg p-3"
                >
                  <span className="text-muted-foreground mt-0.5 flex-shrink-0">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p
                      className={`text-xs font-600 mt-0.5 ${
                        item.highlight ? 'text-red-600' : 'text-foreground'
                      }`}
                    >
                      {item.value}
                      {item.highlight && ' · Overdue'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider">
                  Task Progress
                </p>
                <span className="text-xs font-700 tabular-nums text-foreground">
                  {task.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    task.status === 'Completed'
                      ? 'bg-green-500'
                      : task.status === 'Blocked' ?'bg-red-400' :'bg-primary'
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>

            {/* Dependency */}
            {task.dependsOn && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <Link2 size={13} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  <span className="font-600">Dependency:</span> This task depends on{' '}
                  <span className="font-600">{task.dependsOn}</span> being completed first.
                </p>
              </div>
            )}

            {/* AI Recommendation */}
            {(task.isEscalated || task.hasBlocker) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={13} className="text-primary" />
                  <p className="text-xs font-700 text-primary">AI Recommendation</p>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {task.hasBlocker
                    ? `This task has been blocked for an extended period. Consider scheduling a direct stakeholder call with ${task.customerName} to resolve the blocker. Historical data shows that direct executive outreach resolves similar blockers within 2–3 business days.`
                    : `This task has been escalated. Recommend immediate owner review and customer communication within 24 hours. Provide a clear resolution timeline to maintain customer confidence.`}
                </p>
              </div>
            )}

            {/* Comments */}
            <div>
              <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-3">
                Activity
              </p>
              <div className="space-y-3 mb-4">
                {[
                  {
                    id: 'cmt-1',
                    author: task.owner,
                    initials: task.ownerInitials,
                    text: 'Updated task status. Waiting on customer IT team to provide access credentials.',
                    time: 'Jul 22, 10:30 AM',
                  },
                  {
                    id: 'cmt-2',
                    author: 'Demo User',
                    initials: 'DU',
                    text: 'Flagged for review. Please provide an updated ETA by end of day.',
                    time: 'Jul 21, 3:15 PM',
                  },
                ].map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center flex-shrink-0">
                      {comment.initials}
                    </div>
                    <div className="flex-1 bg-muted/40 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-600 text-foreground">
                          {comment.author}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* New comment */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-700 flex items-center justify-center flex-shrink-0">
                  AK
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or update…"
                    rows={2}
                    className="w-full text-xs bg-muted/40 border border-border rounded-lg p-3 text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  {newComment && (
                    <div className="flex justify-end mt-1.5">
                      <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-600 hover:bg-primary/90 transition-colors">
                        Post Comment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center gap-3 flex-shrink-0 bg-muted/20">
          <button className="flex-1 bg-primary text-primary-foreground text-xs font-600 px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <CheckCircle2 size={13} />
            Mark Complete
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-border text-xs font-600 text-secondary-foreground hover:bg-muted transition-colors flex items-center gap-2">
            <User size={13} />
            Reassign
          </button>
          {!task.isEscalated && (
            <button className="px-4 py-2.5 rounded-lg border border-red-200 text-xs font-600 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
              <AlertTriangle size={13} />
              Escalate
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-border text-xs font-600 text-muted-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}