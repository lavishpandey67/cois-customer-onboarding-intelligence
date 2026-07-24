'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, Bell, Shield, Check, X } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive';
  customers: number;
}

const teamMembers: TeamMember[] = [
  { id: 'tm-001', name: 'Sarah Chen', initials: 'SC', email: 'sarah.chen@novaflow.com', role: 'Senior CS Manager', department: 'Customer Success', status: 'Active', customers: 6 },
  { id: 'tm-002', name: 'Marcus Webb', initials: 'MW', email: 'marcus.webb@novaflow.com', role: 'CS Manager', department: 'Customer Success', status: 'Active', customers: 5 },
  { id: 'tm-003', name: 'Priya Nair', initials: 'PN', email: 'priya.nair@novaflow.com', role: 'CS Specialist', department: 'Customer Success', status: 'Active', customers: 5 },
  { id: 'tm-004', name: 'Jordan Ellis', initials: 'JE', email: 'jordan.ellis@novaflow.com', role: 'Implementation Specialist', department: 'Operations', status: 'Active', customers: 5 },
  { id: 'tm-005', name: 'Aiko Tanaka', initials: 'AT', email: 'aiko.tanaka@novaflow.com', role: 'CS Manager', department: 'Customer Success', status: 'Active', customers: 5 },
  { id: 'tm-006', name: 'Daniel Osei', initials: 'DO', email: 'daniel.osei@novaflow.com', role: 'Senior CS Manager', department: 'Customer Success', status: 'Active', customers: 6 },
  { id: 'tm-007', name: 'Lena Müller', initials: 'LM', email: 'lena.muller@novaflow.com', role: 'CS Specialist', department: 'Customer Success', status: 'Active', customers: 5 },
  { id: 'tm-008', name: 'Ryan Castillo', initials: 'RC', email: 'ryan.castillo@novaflow.com', role: 'Implementation Specialist', department: 'Operations', status: 'Active', customers: 5 },
  { id: 'tm-009', name: 'Fatima Al-Rashid', initials: 'FA', email: 'fatima.alrashid@novaflow.com', role: 'CS Manager', department: 'Customer Success', status: 'Active', customers: 4 },
  { id: 'tm-010', name: 'Chris Nakamura', initials: 'CN', email: 'chris.nakamura@novaflow.com', role: 'CS Specialist', department: 'Customer Success', status: 'Active', customers: 4 },
  { id: 'tm-011', name: 'Demo User', initials: 'DU', email: 'demo@novaflow.com', role: 'Ops Director', department: 'Operations', status: 'Active', customers: 0 },
];

const roleColors: Record<string, string> = {
  'Ops Director': 'bg-purple-100 text-purple-700',
  'Senior CS Manager': 'bg-blue-100 text-blue-700',
  'CS Manager': 'bg-indigo-100 text-indigo-700',
  'CS Specialist': 'bg-cyan-100 text-cyan-700',
  'Implementation Specialist': 'bg-teal-100 text-teal-700',
};

interface NotifPref {
  label: string;
  description: string;
  enabled: boolean;
}

export default function AdministrationPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'notifications' | 'roles'>('team');
  const [prefs, setPrefs] = useState<NotifPref[]>([
    { label: 'Risk Alert Notifications', description: 'Receive alerts when customers are flagged as high or critical risk', enabled: true },
    { label: 'Milestone Completion Alerts', description: 'Get notified when customers complete key onboarding milestones', enabled: true },
    { label: 'Weekly AI Summary', description: 'Receive AI-generated weekly onboarding performance summary every Monday', enabled: true },
    { label: 'Task Escalation Alerts', description: 'Notifications when tasks are escalated or overdue by 3+ days', enabled: false },
    { label: 'Go Live Reminders', description: 'Reminders 7 days and 1 day before scheduled Go Live dates', enabled: true },
    { label: 'Health Score Drops', description: 'Alert when a customer health score drops by 10+ points in a week', enabled: false },
  ]);

  const togglePref = (i: number) => setPrefs(prev => prev.map((p, idx) => idx === i ? { ...p, enabled: !p.enabled } : p));

  return (
    <AppLayout title="Administration" subtitle="Team management, roles, and notification preferences">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-4">
          {([
            { id: 'team', label: 'Team Members', icon: <Users size={14} /> },
            { id: 'roles', label: 'Role Assignments', icon: <Shield size={14} /> },
            { id: 'notifications', label: 'Notification Preferences', icon: <Bell size={14} /> },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-600 transition-all duration-150 ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Team Members */}
        {activeTab === 'team' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-700 text-foreground">Team Members</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{teamMembers.length} members · NovaFlow Technologies</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Member', 'Email', 'Role', 'Department', 'Customers', 'Status'].map(h => (
                      <th key={h} className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member, i) => (
                    <tr key={member.id} className={`border-b border-border last:border-0 hover:bg-muted/40 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center flex-shrink-0">{member.initials}</div>
                          <span className="text-xs font-600 text-foreground">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{member.email}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-600 px-2 py-0.5 rounded-md ${roleColors[member.role] || 'bg-gray-100 text-gray-600'}`}>{member.role}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{member.department}</td>
                      <td className="px-5 py-3 text-xs font-600 tabular-nums text-foreground">{member.customers > 0 ? member.customers : '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-600 px-2 py-0.5 rounded-md ${member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{member.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Role Assignments */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            {[
              { role: 'Ops Director', permissions: ['Full dashboard access', 'Risk alert management', 'Team administration', 'Report generation', 'AI insights access'], members: ['Demo User'] },
              { role: 'Senior CS Manager', permissions: ['Customer management', 'Task management', 'Milestone tracking', 'Risk flag creation', 'Report viewing'], members: ['Sarah Chen', 'Daniel Osei'] },
              { role: 'CS Manager', permissions: ['Customer management', 'Task management', 'Milestone tracking', 'Report viewing'], members: ['Marcus Webb', 'Aiko Tanaka', 'Fatima Al-Rashid'] },
              { role: 'CS Specialist', permissions: ['Customer viewing', 'Task updates', 'Timeline viewing'], members: ['Priya Nair', 'Lena Müller', 'Chris Nakamura'] },
              { role: 'Implementation Specialist', permissions: ['Task management', 'Milestone updates', 'Customer timeline access'], members: ['Jordan Ellis', 'Ryan Castillo'] },
            ].map(r => (
              <div key={r.role} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={14} className="text-primary" />
                      <span className={`text-xs font-700 px-2 py-0.5 rounded-md ${roleColors[r.role] || 'bg-gray-100 text-gray-600'}`}>{r.role}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {r.permissions.map(p => (
                        <span key={p} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">{p}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Assigned to:</span>
                      {r.members.map(m => (
                        <span key={m} className="text-xs font-600 text-foreground">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification Preferences */}
        {activeTab === 'notifications' && (
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs text-muted-foreground">Configure notification preferences for Demo User · Ops Director</p>
            {prefs.map((pref, i) => (
              <div key={pref.label} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-700 text-foreground">{pref.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{pref.description}</p>
                </div>
                <button
                  onClick={() => togglePref(i)}
                  className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center px-0.5 flex-shrink-0 ${pref.enabled ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center">
                    {pref.enabled ? <Check size={9} className="text-primary" /> : <X size={9} className="text-muted-foreground" />}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
