'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, ChevronUp, ChevronDown, ChevronsUpDown, Eye, Pencil, Sparkles, ChevronLeft, ChevronRight, X,  } from 'lucide-react';
import { customers } from '@/lib/mockData';
import type { Customer, OnboardingStage, CustomerTier, Region, HealthBand } from '@/lib/mockData';
import HealthScoreBadge from '@/components/ui/HealthScoreBadge';
import StageBadge from '@/components/ui/StageBadge';
import Badge from '@/components/ui/Badge';
import CustomerDrawer from './CustomerDrawer';

// Backend integration: replace customers with /api/customers?page=X&filters=...

type SortField = keyof Customer;
type SortDir = 'asc' | 'desc';

const STAGE_OPTIONS: OnboardingStage[] = [
  'Contract Signed', 'Kickoff Meeting', 'Account Setup',
  'Configuration', 'Training', 'First Login', 'First Value', 'Go Live', 'Success Handoff',
];
const TIER_OPTIONS: CustomerTier[] = ['SMB', 'Mid-Market', 'Enterprise'];
const REGION_OPTIONS: Region[] = ['North America', 'Europe', 'Asia Pacific'];
const HEALTH_OPTIONS: HealthBand[] = ['excellent', 'good', 'fair', 'poor'];
const RISK_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function CustomerTableSection() {
  const [search, setSearch] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedHealth, setSelectedHealth] = useState<string[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('healthScore');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerCustomer, setDrawerCustomer] = useState<Customer | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let data = [...customers];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.company.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.manager.toLowerCase().includes(q)
      );
    }
    if (selectedStages.length)
      data = data.filter((c) => selectedStages.includes(c.stage));
    if (selectedTiers.length)
      data = data.filter((c) => selectedTiers.includes(c.tier));
    if (selectedRegions.length)
      data = data.filter((c) => selectedRegions.includes(c.region));
    if (selectedHealth.length)
      data = data.filter((c) => selectedHealth.includes(c.healthBand));
    if (selectedRisk.length)
      data = data.filter((c) => selectedRisk.includes(c.riskLevel));

    data.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return data;
  }, [search, selectedStages, selectedTiers, selectedRegions, selectedHealth, selectedRisk, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  }

  function toggleRow(id: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedRows.size === paged.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paged.map((c) => c.id)));
    }
  }

  function toggleFilter(
    arr: string[],
    setArr: (v: string[]) => void,
    val: string
  ) {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    setPage(1);
  }

  function clearAllFilters() {
    setSelectedStages([]);
    setSelectedTiers([]);
    setSelectedRegions([]);
    setSelectedHealth([]);
    setSelectedRisk([]);
    setSearch('');
    setPage(1);
  }

  const activeFilterCount =
    selectedStages.length +
    selectedTiers.length +
    selectedRegions.length +
    selectedHealth.length +
    selectedRisk.length;

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ChevronsUpDown size={12} className="text-muted-foreground" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-primary" />
    ) : (
      <ChevronDown size={12} className="text-primary" />
    );
  }

  function ColHeader({
    label,
    field,
    className = '',
  }: {
    label: string;
    field: SortField;
    className?: string;
  }) {
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

  const tierVariant: Record<CustomerTier, 'enterprise' | 'mid-market' | 'smb'> = {
    Enterprise: 'enterprise',
    'Mid-Market': 'mid-market',
    SMB: 'smb',
  };

  const riskVariant: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
    Critical: 'critical',
    High: 'high',
    Medium: 'medium',
    Low: 'low',
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1 min-w-52">
            <Search size={14} className="text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search company, industry, manager…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={13} className="text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-600 border transition-all duration-150 ${
              showFilters || activeFilterCount > 0
                ? 'bg-primary/10 text-primary border-primary/30' :'border-border text-secondary-foreground hover:bg-muted'
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

          {/* Export */}
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-600 border border-border text-secondary-foreground hover:bg-muted transition-all duration-150">
            <Download size={14} />
            Export
          </button>

          {/* Count */}
          <span className="text-sm text-muted-foreground tabular-nums ml-auto">
            {filtered.length} customers
          </span>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="px-5 py-4 border-b border-border bg-muted/30 fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Stage */}
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">
                  Stage
                </p>
                <div className="flex flex-wrap gap-1">
                  {STAGE_OPTIONS.map((s) => (
                    <button
                      key={`filter-stage-${s}`}
                      onClick={() => toggleFilter(selectedStages, setSelectedStages, s)}
                      className={`text-xs px-2 py-1 rounded-md border transition-all duration-100 ${
                        selectedStages.includes(s)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-secondary-foreground hover:bg-muted'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {/* Tier */}
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">
                  Tier
                </p>
                <div className="flex flex-wrap gap-1">
                  {TIER_OPTIONS.map((t) => (
                    <button
                      key={`filter-tier-${t}`}
                      onClick={() => toggleFilter(selectedTiers, setSelectedTiers, t)}
                      className={`text-xs px-2 py-1 rounded-md border transition-all duration-100 ${
                        selectedTiers.includes(t)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-secondary-foreground hover:bg-muted'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {/* Region */}
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">
                  Region
                </p>
                <div className="flex flex-wrap gap-1">
                  {REGION_OPTIONS.map((r) => (
                    <button
                      key={`filter-region-${r}`}
                      onClick={() => toggleFilter(selectedRegions, setSelectedRegions, r)}
                      className={`text-xs px-2 py-1 rounded-md border transition-all duration-100 ${
                        selectedRegions.includes(r)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-secondary-foreground hover:bg-muted'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              {/* Health */}
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">
                  Health
                </p>
                <div className="flex flex-wrap gap-1">
                  {HEALTH_OPTIONS.map((h) => (
                    <button
                      key={`filter-health-${h}`}
                      onClick={() => toggleFilter(selectedHealth, setSelectedHealth, h)}
                      className={`text-xs px-2 py-1 rounded-md border capitalize transition-all duration-100 ${
                        selectedHealth.includes(h)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-secondary-foreground hover:bg-muted'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              {/* Risk */}
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">
                  Risk
                </p>
                <div className="flex flex-wrap gap-1">
                  {RISK_OPTIONS.map((r) => (
                    <button
                      key={`filter-risk-${r}`}
                      onClick={() => toggleFilter(selectedRisk, setSelectedRisk, r)}
                      className={`text-xs px-2 py-1 rounded-md border transition-all duration-100 ${
                        selectedRisk.includes(r)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-secondary-foreground hover:bg-muted'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Bulk action bar */}
        {selectedRows.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-primary/5 border-b border-primary/20 slide-up">
            <span className="text-sm font-600 text-primary tabular-nums">
              {selectedRows.size} selected
            </span>
            <div className="flex items-center gap-2 ml-4">
              <button className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-600 hover:bg-primary/90 transition-colors">
                Reassign Manager
              </button>
              <button className="text-xs px-3 py-1.5 rounded-lg border border-border text-secondary-foreground font-600 hover:bg-muted transition-colors">
                Export Selected
              </button>
              <button className="text-xs px-3 py-1.5 rounded-lg border border-border text-secondary-foreground font-600 hover:bg-muted transition-colors">
                Generate AI Summary
              </button>
              <button
                onClick={() => setSelectedRows(new Set())}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-2"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paged.length && paged.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border accent-primary"
                  />
                </th>
                <ColHeader label="Company" field="company" />
                <ColHeader label="Industry" field="industry" />
                <ColHeader label="Tier" field="tier" />
                <ColHeader label="Health" field="healthScore" />
                <ColHeader label="Stage" field="stage" />
                <ColHeader label="Progress" field="progress" />
                <ColHeader label="Manager" field="manager" />
                <ColHeader label="Days in Stage" field="daysInStage" />
                <ColHeader label="Risk" field="riskLevel" />
                <th className="px-4 py-3 w-24">
                  <span className="text-xs font-600 text-muted-foreground uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Search size={20} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm font-600 text-foreground">
                        No customers match your filters
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-primary font-600 hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((customer, i) => (
                  <tr
                    key={customer.id}
                    className={`border-b border-border last:border-0 transition-colors duration-100 group ${
                      selectedRows.has(customer.id)
                        ? 'bg-primary/5'
                        : i % 2 === 0
                        ? 'hover:bg-muted/40' :'bg-muted/15 hover:bg-muted/40'
                    }`}
                  >
                    <td className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(customer.id)}
                        onChange={() => toggleRow(customer.id)}
                        className="rounded border-border accent-primary"
                      />
                    </td>
                    {/* Company */}
                    <td className="px-4 py-3">
                      <div>
                        <button
                          onClick={() => setDrawerCustomer(customer)}
                          className="font-600 text-foreground text-xs hover:text-primary transition-colors text-left"
                        >
                          {customer.company}
                        </button>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {customer.region}
                        </p>
                      </div>
                    </td>
                    {/* Industry */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground">
                        {customer.industry}
                      </span>
                    </td>
                    {/* Tier */}
                    <td className="px-4 py-3">
                      <Badge variant={tierVariant[customer.tier]}>
                        {customer.tier}
                      </Badge>
                    </td>
                    {/* Health */}
                    <td className="px-4 py-3">
                      <HealthScoreBadge
                        score={customer.healthScore}
                        band={customer.healthBand}
                        showBar
                      />
                    </td>
                    {/* Stage */}
                    <td className="px-4 py-3">
                      <StageBadge stage={customer.stage} />
                    </td>
                    {/* Progress */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${customer.progress}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {customer.progress}%
                        </span>
                      </div>
                    </td>
                    {/* Manager */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center flex-shrink-0">
                          {customer.managerInitials}
                        </div>
                        <span className="text-xs text-foreground">
                          {customer.manager.split(' ')[0]}
                        </span>
                      </div>
                    </td>
                    {/* Days in Stage */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-600 tabular-nums ${
                          customer.daysInStage >= 14
                            ? 'text-red-600'
                            : customer.daysInStage >= 8
                            ? 'text-amber-600' :'text-muted-foreground'
                        }`}
                      >
                        {customer.daysInStage}d
                      </span>
                    </td>
                    {/* Risk */}
                    <td className="px-4 py-3">
                      <Badge variant={riskVariant[customer.riskLevel]}>
                        {customer.riskLevel}
                      </Badge>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => setDrawerCustomer(customer)}
                          title="View customer profile"
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-all duration-100"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          title="Edit customer"
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-100"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="AI summary"
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-all duration-100"
                        >
                          <Sparkles size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs border border-border rounded-md px-2 py-1 bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={`pagesize-${s}`} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground tabular-nums">
              {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 rounded-md text-xs font-600 transition-all duration-100 ${
                    page === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Customer detail drawer */}
      {drawerCustomer && (
        <CustomerDrawer
          customer={drawerCustomer}
          onClose={() => setDrawerCustomer(null)}
        />
      )}
    </>
  );
}