'use client';

import React from 'react';
import { AlertTriangle, Link2, Calendar } from 'lucide-react';
import type { Task } from '@/lib/mockData';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  selected: boolean;
  onToggleSelect: () => void;
}

const priorityStyles: Record<Task['priority'], string> = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
};

const priorityDot: Record<Task['priority'], string> = {
  Critical: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-amber-500',
  Low: 'bg-slate-400',
};

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}`;
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date('2026-07-24');
}

export default function TaskCard({
  task,
  onClick,
  selected,
  onToggleSelect,
}: TaskCardProps) {
  const overdue = isOverdue(task.dueDate) && task.status !== 'Completed';

  return (
    <div
      className={`rounded-lg border p-3 cursor-pointer transition-all duration-150 hover:shadow-sm group ${
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : task.status === 'Blocked' ?'border-red-200 bg-red-50/40 hover:border-red-300' :'border-border bg-card hover:border-primary/30 hover:bg-muted/20'
      }`}
      onClick={onClick}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 rounded border-border accent-primary flex-shrink-0"
          />
          <p className="text-xs font-600 text-foreground leading-snug line-clamp-2">
            {task.title}
          </p>
        </div>
        {task.isEscalated && (
          <AlertTriangle
            size={13}
            className="text-red-500 flex-shrink-0 mt-0.5"
            title="Escalated"
          />
        )}
      </div>

      {/* Customer */}
      <p className="text-xs text-muted-foreground mb-2 truncate pl-5">
        {task.customerName}
      </p>

      {/* Priority badge */}
      <div className="flex items-center gap-2 mb-2 pl-5">
        <span
          className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md border font-600 ${priorityStyles[task.priority]}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[task.priority]}`} />
          {task.priority}
        </span>
        {task.hasBlocker && (
          <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md border font-600 bg-red-100 text-red-700 border-red-200">
            Blocked
          </span>
        )}
        {task.dependsOn && (
          <Link2 size={11} className="text-muted-foreground" title="Has dependency" />
        )}
      </div>

      {/* Progress bar (if in progress) */}
      {task.status === 'In Progress' && task.progress > 0 && (
        <div className="mb-2 pl-5">
          <div className="w-full h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pl-5">
        <div className="flex items-center gap-1">
          <Calendar size={11} className="text-muted-foreground" />
          <span
            className={`text-xs tabular-nums ${
              overdue ? 'text-red-600 font-600' : 'text-muted-foreground'
            }`}
          >
            {formatDate(task.dueDate)}
            {overdue && ' · Overdue'}
          </span>
        </div>
        <div
          className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center"
          title={task.owner}
        >
          {task.ownerInitials}
        </div>
      </div>
    </div>
  );
}