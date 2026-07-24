'use client';

import React from 'react';
import type { Task } from '@/lib/mockData';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

type KanbanStatus = Task['status'];

const columns: { id: KanbanStatus; label: string; color: string; headerBg: string }[] = [
  {
    id: 'Backlog',
    label: 'Backlog',
    color: 'text-muted-foreground',
    headerBg: 'bg-muted/60',
  },
  {
    id: 'In Progress',
    label: 'In Progress',
    color: 'text-blue-700',
    headerBg: 'bg-blue-50',
  },
  {
    id: 'Blocked',
    label: 'Blocked',
    color: 'text-red-700',
    headerBg: 'bg-red-50',
  },
  {
    id: 'In Review',
    label: 'In Review',
    color: 'text-amber-700',
    headerBg: 'bg-amber-50',
  },
  {
    id: 'Completed',
    label: 'Completed',
    color: 'text-green-700',
    headerBg: 'bg-green-50',
  },
];

const columnBorder: Record<KanbanStatus, string> = {
  Backlog: 'border-border',
  'In Progress': 'border-blue-200',
  Blocked: 'border-red-200',
  'In Review': 'border-amber-200',
  Completed: 'border-green-200',
};

const columnDot: Record<KanbanStatus, string> = {
  Backlog: 'bg-muted-foreground',
  'In Progress': 'bg-blue-500',
  Blocked: 'bg-red-500',
  'In Review': 'bg-amber-500',
  Completed: 'bg-green-500',
};

export default function KanbanBoard({
  tasks,
  onTaskClick,
  selectedIds,
  onToggleSelect,
}: KanbanBoardProps) {
  const tasksByStatus = (status: KanbanStatus) =>
    tasks.filter((t) => t.status === status);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-4 items-start">
      {columns.map((col) => {
        const colTasks = tasksByStatus(col.id);
        return (
          <div
            key={`kanban-col-${col.id}`}
            className={`bg-card border ${columnBorder[col.id]} rounded-xl overflow-hidden flex flex-col`}
          >
            {/* Column header */}
            <div
              className={`flex items-center justify-between px-4 py-3 border-b ${columnBorder[col.id]} ${col.headerBg}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${columnDot[col.id]}`}
                />
                <span className={`text-xs font-700 ${col.color}`}>
                  {col.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs tabular-nums text-muted-foreground font-600 bg-card/80 px-1.5 py-0.5 rounded-md border border-border/50">
                  {colTasks.length}
                </span>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Cards */}
            <div className="p-3 space-y-2.5 min-h-32 flex-1">
              {colTasks.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-center">
                  <p className="text-xs text-muted-foreground">No tasks here</p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                    selected={selectedIds.has(task.id)}
                    onToggleSelect={() => onToggleSelect(task.id)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}