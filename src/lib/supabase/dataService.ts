import { createClient } from '@/lib/supabase/client';
import type { Customer, Task, RiskAlert } from '@/lib/mockData';

function isSchemaError(error: any): boolean {
  if (!error) return false;
  if (error.code && typeof error.code === 'string') {
    const cls = error.code.substring(0, 2);
    if (cls === '42' || cls === '08') return true;
    if (cls === '23') return false;
  }
  if (error.message) {
    const patterns = [
      /relation.*does not exist/i,
      /column.*does not exist/i,
      /function.*does not exist/i,
      /syntax error/i,
      /type.*does not exist/i,
    ];
    return patterns.some((p) => p.test(error.message));
  }
  return false;
}

// ─── Customers ────────────────────────────────────────────────────────────────

function rowToCustomer(row: any): Customer {
  return {
    id: row.id,
    company: row.company,
    industry: row.industry,
    tier: row.tier,
    region: row.region,
    healthScore: row.health_score,
    healthBand: row.health_band,
    stage: row.stage,
    progress: row.progress,
    manager: row.manager,
    managerInitials: row.manager_initials,
    daysInStage: row.days_in_stage,
    riskLevel: row.risk_level,
    riskScore: row.risk_score,
    contractValue: row.contract_value,
    employees: row.employees,
    lastActivity: row.last_activity ?? '',
    accountOwner: row.account_owner,
    startDate: row.start_date ?? '',
    expectedGoLive: row.expected_go_live ?? '',
  };
}

export async function fetchCustomers(): Promise<Customer[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('health_score', { ascending: true });
    if (error) {
      if (isSchemaError(error)) throw error;
      console.warn('fetchCustomers error:', error.message);
      return [];
    }
    return (data ?? []).map(rowToCustomer);
  } catch (err: any) {
    console.error('fetchCustomers failed:', err.message);
    return [];
  }
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    customerId: row.customer_id ?? '',
    customerName: row.customer_name,
    owner: row.owner,
    ownerInitials: row.owner_initials,
    priority: row.priority,
    dueDate: row.due_date ?? '',
    status: row.status,
    progress: row.progress,
    milestone: row.milestone,
    hasBlocker: row.has_blocker,
    isEscalated: row.is_escalated,
    dependsOn: row.depends_on ?? null,
    description: row.description,
    createdAt: row.created_at ?? '',
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      if (isSchemaError(error)) throw error;
      console.warn('fetchTasks error:', error.message);
      return [];
    }
    return (data ?? []).map(rowToTask);
  } catch (err: any) {
    console.error('fetchTasks failed:', err.message);
    return [];
  }
}

// ─── Milestone Stages ─────────────────────────────────────────────────────────

export interface MilestoneRow {
  name: string;
  totalCustomers: number;
  completed: number;
  completionRate: number;
  avgDays: number;
  targetDays: number;
  currentCustomers: string[];
  status: 'on-track' | 'at-risk' | 'delayed';
}

function rowToMilestone(row: any): MilestoneRow {
  return {
    name: row.name,
    totalCustomers: row.total_customers,
    completed: row.completed,
    completionRate: Number(row.completion_rate),
    avgDays: Number(row.avg_days),
    targetDays: row.target_days,
    currentCustomers: row.current_customers ?? [],
    status: row.status,
  };
}

export async function fetchMilestones(): Promise<MilestoneRow[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('milestone_stages')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      if (isSchemaError(error)) throw error;
      console.warn('fetchMilestones error:', error.message);
      return [];
    }
    return (data ?? []).map(rowToMilestone);
  } catch (err: any) {
    console.error('fetchMilestones failed:', err.message);
    return [];
  }
}

// ─── Risk Alerts ──────────────────────────────────────────────────────────────

function rowToRiskAlert(row: any): RiskAlert {
  return {
    id: row.id,
    customerId: row.customer_id ?? '',
    company: row.company,
    tier: row.tier,
    issue: row.issue,
    severity: row.severity,
    daysSinceLastActivity: row.days_since_last_activity,
    manager: row.manager,
    revenueAtRisk: row.revenue_at_risk,
  };
}

export async function fetchRiskAlerts(): Promise<RiskAlert[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('risk_alerts')
      .select('*')
      .order('revenue_at_risk', { ascending: false });
    if (error) {
      if (isSchemaError(error)) throw error;
      console.warn('fetchRiskAlerts error:', error.message);
      return [];
    }
    return (data ?? []).map(rowToRiskAlert);
  } catch (err: any) {
    console.error('fetchRiskAlerts failed:', err.message);
    return [];
  }
}

// ─── Real-time subscriptions ──────────────────────────────────────────────────

export function subscribeToCustomers(callback: (customers: Customer[]) => void) {
  const supabase = createClient();
  const channel = supabase
    .channel('customers_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, async () => {
      const customers = await fetchCustomers();
      callback(customers);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToTasks(callback: (tasks: Task[]) => void) {
  const supabase = createClient();
  const channel = supabase
    .channel('tasks_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
      const tasks = await fetchTasks();
      callback(tasks);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToRiskAlerts(callback: (alerts: RiskAlert[]) => void) {
  const supabase = createClient();
  const channel = supabase
    .channel('risk_alerts_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'risk_alerts' }, async () => {
      const alerts = await fetchRiskAlerts();
      callback(alerts);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}
