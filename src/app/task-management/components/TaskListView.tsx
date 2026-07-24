'use client';

import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertTriangle,
  Link2,
} from 'lucide-react';
import type { Task } from '@/lib/mockData';
import Badge from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

type SortField = 'title' | 'customerName' | 'owner' | 'priority' | 'dueDate' | 'status' | 'progress';
type SortDir = 'asc' | 'desc';

const priorityOrder: Record<Task['priority'], number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const statusOrder: Record<Task['status'], number> = {
  Blocked: 0,
  'In Progress': 1,
  'In Review': 2,
  Backlog: 3,
  Completed: 4,
};

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
  return `${months[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}`;
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date('2026-07-24');
}

export default function TaskListView({
  tasks,
  onTaskClick,
  selectedIds,
  onToggleSelect,
}: TaskListViewProps) {
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  }

  const sorted = [...tasks].sort((a, b) => {
    let av: string | number;
    let bv: string | number;

    if (sortField === 'priority') {
      av = priorityOrder[a.priority];
      bv = priorityOrder[b.priority];
    } else if (sortField === 'status') {
      av = statusOrder[a.status];
      bv = statusOrder[b.status];
    } else if (sortField === 'progress') {
      av = a.progress;
      bv = b.progress;
    } else {
      av = a[sortField] as string;
      bv = b[sortField] as string;
    }

    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'asc' ? av - bv : bv - av;
    }
    return sortDir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ChevronsUpDown size={11} className="text-muted-foreground" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={11} className="text-primary" />
    ) : (
      <ChevronDown size={11} className="text-primary" />
    );
  }

  function ColHeader({ label, field, className = '' }: { label: string; field: SortField; className?: string }) {
    return (
      <th
        className={`text-left px-4 py-3 cursor-pointer select-none group ${className}`}
        onClick={() => toggleSort(field)}
      >
        <div className="flex items-center gap-1">
          <span className="text-xs font-600 text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
            {label}
          </span>
          <SortIcon field={field} />
        </div>
      </th>
    );
  }

  const allSelected = sorted.length > 0 && sorted.every((t) => selectedIds.has(t.id));

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => {
                    if (allSelected) {
                      sorted.forEach((t) => {
                        if (selectedIds.has(t.id)) onToggleSelect(t.id);
                      });
                    } else {
                      sorted.forEach((t) => {
                        if (!selectedIds.has(t.id)) onToggleSelect(t.id);
                      });
                    }
                  }}
                  className="rounded border-border accent-primary"
                />
              </th>
              <ColHeader label="Task" field="title" className="min-w-[240px]" />
              <ColHeader label="Customer" field="customerName" />
              <ColHeader label="Owner" field="owner" />
              <ColHeader label="Priority" field="priority" />
              <ColHeader label="Status" field="status" />
              <ColHeader label="Due Date" field="dueDate" />
              <ColHeader label="Progress" field="progress" />
              <th className="px-4 py-3">
                <span className="text-xs font-600 text-muted-foreground uppercase tracking-wider">
                  Flags
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center">
                  <p className="text-sm font-600 text-foreground">No tasks match your filters</p>
                  <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
                </td>
              </tr>
            ) : (
              sorted.map((task, i) => {
                const overdue = isOverdue(task.dueDate) && task.status !== 'Completed';
                return (
                  <tr
                    key={task.id}
                    className={`border-b border-border last:border-0 transition-colors duration-100 cursor-pointer group ${
                      selectedIds.has(task.id)
                        ? 'bg-primary/5'
                        : i % 2 === 0
                        ? 'hover:bg-muted/40' :'bg-muted/15 hover:bg-muted/40'
                    }`}
                    onClick={() => onTaskClick(task)}
                  >
                    <td className="px-4 py-3 w-10" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(task.id)}
                        onChange={() => onToggleSelect(task.id)}
                        className="rounded border-border accent-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div>
                          <p className="text-xs font-600 text-foreground leading-snug">
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {task.milestone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-foreground truncate max-w-[140px]">
                        {task.customerName}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center flex-shrink-0">
                          {task.ownerInitials}
                        </div>
                        <span className="text-xs text-foreground">
                          {task.owner.split(' ')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={priorityVariant[task.priority]}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-600 ${statusStyles[task.status]}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs tabular-nums font-600 ${
                          overdue ? 'text-red-600' : 'text-muted-foreground'
                        }`}
                      >
                        {formatDate(task.dueDate)}
                        {overdue && ' ⚠'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              task.status === 'Completed'
                                ? 'bg-green-500'
                                : task.status === 'Blocked' ?'bg-red-400' :'bg-primary'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {task.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {task.isEscalated && (
                          <span title="Escalated">
                            <AlertTriangle size={13} className="text-red-500" />
                          </span>
                        )}
                        {task.dependsOn && (
                          <span title="Has dependency">
                            <Link2 size={13} className="text-muted-foreground" />
                          </span>
                        )}
                        {task.hasBlocker && (
                          <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-md font-600">
                            Blocked
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}