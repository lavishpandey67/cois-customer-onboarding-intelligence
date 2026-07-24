'use client';

import React, { useState, useMemo } from 'react';
import { LayoutGrid, List, Search, Filter, Plus, X, AlertTriangle,  } from 'lucide-react';
import { tasks } from '@/lib/mockData';
import type { Task } from '@/lib/mockData';
import KanbanBoard from './KanbanBoard';
import TaskListView from './TaskListView';
import TaskDetailModal from './TaskDetailModal';

// Backend integration: replace tasks with /api/tasks?page=X&filters=...

type ViewMode = 'kanban' | 'list';

const OWNER_OPTIONS = [
  'Sarah Chen',
  'Marcus Webb',
  'Priya Nair',
  'Jordan Ellis',
  'Aiko Tanaka',
  'Daniel Osei',
  'Lena Müller',
  'Ryan Castillo',
  'Fatima Al-Rashid',
  'Chris Nakamura',
];

const PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];
const STATUS_OPTIONS = ['Backlog', 'In Progress', 'Blocked', 'In Review', 'Completed'];

export default function TaskManagementSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let data = [...tasks];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.owner.toLowerCase().includes(q)
      );
    }
    if (selectedOwners.length)
      data = data.filter((t) => selectedOwners.includes(t.owner));
    if (selectedPriorities.length)
      data = data.filter((t) => selectedPriorities.includes(t.priority));
    if (selectedStatuses.length)
      data = data.filter((t) => selectedStatuses.includes(t.status));
    return data;
  }, [search, selectedOwners, selectedPriorities, selectedStatuses]);

  function toggleFilter(
    arr: string[],
    setArr: (v: string[]) => void,
    val: string
  ) {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  function clearFilters() {
    setSelectedOwners([]);
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setSearch('');
  }

  const activeFilterCount =
    selectedOwners.length + selectedPriorities.length + selectedStatuses.length;

  const escalatedCount = filtered.filter((t) => t.isEscalated).length;
  const blockedCount = filtered.filter((t) => t.status === 'Blocked').length;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertTriangle size={13} className="text-red-600" />
          <span className="text-xs font-600 text-red-700">
            {blockedCount} Blocked
          </span>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle size={13} className="text-amber-600" />
          <span className="text-xs font-600 text-amber-700">
            {escalatedCount} Escalated
          </span>
        </div>
        <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-2">
          <span className="text-xs font-600 text-muted-foreground">
            {filtered.length} tasks shown
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 min-w-52">
          <Search size={14} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search tasks, customers, owners…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={13} className="text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Filter */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-600 border transition-all duration-150 ${
            showFilters || activeFilterCount > 0
              ? 'bg-primary/10 text-primary border-primary/30' :'bg-card border-border text-secondary-foreground hover:bg-muted'
          }`}
        >
          <Filter size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* View toggle */}
        <div className="flex items-center bg-card border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-600 transition-all duration-150 ${
              viewMode === 'kanban' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:bg-muted'
            }`}
          >
            <LayoutGrid size={13} />
            Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-600 transition-all duration-150 ${
              viewMode === 'list' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:bg-muted'
            }`}
          >
            <List size={13} />
            List
          </button>
        </div>

        {/* New task */}
        <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-600 hover:bg-primary/90 transition-colors active:scale-95 duration-150">
          <Plus size={14} />
          New Task
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-5 fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Owner */}
            <div>
              <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">
                Owner
              </p>
              <div className="flex flex-wrap gap-1">
                {OWNER_OPTIONS.map((o) => (
                  <button
                    key={`fowner-${o}`}
                    onClick={() => toggleFilter(selectedOwners, setSelectedOwners, o)}
                    className={`text-xs px-2 py-1 rounded-md border transition-all duration-100 ${
                      selectedOwners.includes(o)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-secondary-foreground hover:bg-muted'
                    }`}
                  >
                    {o.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            {/* Priority */}
            <div>
              <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">
                Priority
              </p>
              <div className="flex flex-wrap gap-1">
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={`fprio-${p}`}
                    onClick={() =>
                      toggleFilter(selectedPriorities, setSelectedPriorities, p)
                    }
                    className={`text-xs px-2 py-1 rounded-md border transition-all duration-100 ${
                      selectedPriorities.includes(p)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-secondary-foreground hover:bg-muted'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {/* Status */}
            <div>
              <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">
                Status
              </p>
              <div className="flex flex-wrap gap-1">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={`fstatus-${s}`}
                    onClick={() =>
                      toggleFilter(selectedStatuses, setSelectedStatuses, s)
                    }
                    className={`text-xs px-2 py-1 rounded-md border transition-all duration-100 ${
                      selectedStatuses.includes(s)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-secondary-foreground hover:bg-muted'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Bulk action bar */}
      {selectedTaskIds.size > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-primary/5 border border-primary/20 rounded-xl slide-up">
          <span className="text-sm font-600 text-primary tabular-nums">
            {selectedTaskIds.size} selected
          </span>
          <div className="flex items-center gap-2 ml-4">
            <button className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-600 hover:bg-primary/90 transition-colors">
              Reassign Owner
            </button>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-border text-secondary-foreground font-600 hover:bg-muted transition-colors">
              Change Status
            </button>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 font-600 hover:bg-red-50 transition-colors">
              Escalate
            </button>
            <button
              onClick={() => setSelectedTaskIds(new Set())}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-2"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main view */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filtered}
          onTaskClick={setSelectedTask}
          selectedIds={selectedTaskIds}
          onToggleSelect={(id) => {
            setSelectedTaskIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            });
          }}
        />
      ) : (
        <TaskListView
          tasks={filtered}
          onTaskClick={setSelectedTask}
          selectedIds={selectedTaskIds}
          onToggleSelect={(id) => {
            setSelectedTaskIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            });
          }}
        />
      )}

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}