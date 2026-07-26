'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, ChevronUp, ChevronDown, ChevronsUpDown, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Customer, OnboardingStage, CustomerTier, Region, HealthBand } from '@/lib/mockData';
import { fetchCustomers, subscribeToCustomers } from '@/lib/supabase/dataService';
import HealthScoreBadge from '@/components/ui/HealthScoreBadge';
import StageBadge from '@/components/ui/StageBadge';
import Badge from '@/components/ui/Badge';
import CustomerDrawer from './CustomerDrawer';

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchCustomers().then((data) => {
      setCustomers(data);
      setLoading(false);
    });
    const unsub = subscribeToCustomers((data) => setCustomers(data));
    return unsub;
  }, []);

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
    if (selectedStages.length) data = data.filter((c) => selectedStages.includes(c.stage));
    if (selectedTiers.length) data = data.filter((c) => selectedTiers.includes(c.tier));
    if (selectedRegions.length) data = data.filter((c) => selectedRegions.includes(c.region));
    if (selectedHealth.length) data = data.filter((c) => selectedHealth.includes(c.healthBand));
    if (selectedRisk.length) data = data.filter((c) => selectedRisk.includes(c.riskLevel));

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
  }, [customers, search, selectedStages, selectedTiers, selectedRegions, selectedHealth, selectedRisk, sortField, sortDir]);

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

  function toggleFilter(arr: string[], setArr: (v: string[]) => void, val: string) {
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
    selectedStages.length + selectedTiers.length + selectedRegions.length +
    selectedHealth.length + selectedRisk.length;

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronsUpDown size={12} className="text-muted-foreground" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-primary" />
    ) : (
      <ChevronDown size={12} className="text-primary" />
    );
  }

  function ColHeader({ label, field, className = '' }: { label: string; field: SortField; className?: string }) {
    return (
      <th className={`text-left px-4 py-3 cursor-pointer select-none group ${className}`} onClick={() => toggleSort(field)}>
        <div className="flex items-center gap-1">
          <span className="text-xs font-600 text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">{label}</span>
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

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading customers…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-wrap">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 flex-1 min-w-52">
            <Search size={14} className="text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search company, industry, manager…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={13} className="text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
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
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full tabular-nums">{activeFilterCount}</span>
            )}
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-600 border border-border text-secondary-foreground hover:bg-muted transition-all duration-150">
            <Download size={14} />
            Export
          </button>
          <span className="text-sm text-muted-foreground tabular-nums ml-auto">{filtered.length} customers</span>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="px-5 py-4 border-b border-border bg-muted/30 fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">Stage</p>
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
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">Tier</p>
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
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">Region</p>
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
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">Health</p>
                <div className="flex flex-wrap gap-1">
                  {HEALTH_OPTIONS.map((h) => (
                    <button
                      key={`filter-health-${h}`}
                      onClick={() => toggleFilter(selectedHealth, setSelectedHealth, h)}
                      className={`text-xs px-2 py-1 rounded-md border transition-all duration-100 capitalize ${
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
              <div>
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider mb-2">Risk</p>
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
              <button onClick={clearAllFilters} className="mt-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={paged.length > 0 && selectedRows.size === paged.length}
                    onChange={toggleAll}
                    className="rounded border-border"
                  />
                </th>
                <ColHeader label="Company" field="company" />
                <ColHeader label="Stage" field="stage" />
                <ColHeader label="Health" field="healthScore" />
                <ColHeader label="Risk" field="riskLevel" />
                <ColHeader label="Tier" field="tier" />
                <ColHeader label="Manager" field="manager" />
                <ColHeader label="Days in Stage" field="daysInStage" />
                <ColHeader label="ARR" field="contractValue" />
                <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/20'}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(c.id)}
                      onChange={() => toggleRow(c.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs font-600 text-foreground leading-tight">{c.company}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.industry}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StageBadge stage={c.stage} progress={c.progress} /></td>
                  <td className="px-4 py-3"><HealthScoreBadge score={c.healthScore} band={c.healthBand} /></td>
                  <td className="px-4 py-3"><Badge variant={riskVariant[c.riskLevel] as any}>{c.riskLevel}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={tierVariant[c.tier]}>{c.tier}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center">{c.managerInitials}</div>
                      <span className="text-xs text-foreground">{c.manager.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-600 tabular-nums ${c.daysInStage > 14 ? 'text-red-600' : c.daysInStage > 7 ? 'text-amber-600' : 'text-foreground'}`}>
                      {c.daysInStage}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-600 tabular-nums text-foreground">${(c.contractValue / 1000).toFixed(0)}K</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDrawerCustomer(c)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="View details">
                        <Eye size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">No customers match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {filtered.length === 0 ? '0' : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)}`} of {filtered.length}
            </span>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-muted disabled:opacity-40 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1 rounded hover:bg-muted disabled:opacity-40 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {drawerCustomer && (
        <CustomerDrawer customer={drawerCustomer} onClose={() => setDrawerCustomer(null)} />
      )}
    </>
  );
}