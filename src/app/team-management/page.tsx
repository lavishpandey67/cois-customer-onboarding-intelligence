'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Mail, CheckCircle, X, RefreshCw, Search, AlertCircle } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  invitedByName: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'ceo', label: 'CEO' },
  { value: 'operations_director', label: 'Operations Director' },
  { value: 'cs_manager', label: 'CS Manager' },
  { value: 'cs_specialist', label: 'CS Specialist' },
  { value: 'support_agent', label: 'Support Agent' },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  ceo: 'bg-purple-100 text-purple-700',
  operations_director: 'bg-violet-100 text-violet-700',
  cs_manager: 'bg-blue-100 text-blue-700',
  cs_specialist: 'bg-cyan-100 text-cyan-700',
  support_agent: 'bg-slate-100 text-slate-700',
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TeamManagementPage() {
  const { profile, canAccess } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('cs_specialist');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  const supabase = createClient();
  const isAdmin = canAccess(['admin', 'operations_director']);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mResult, iResult] = await Promise.all([
        supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('team_invitations').select('*').order('created_at', { ascending: false }),
      ]);
      const mData = mResult.data;
      const iData = iResult.data;
      if (mData) setMembers(mData.map(r => ({
        id: r.id, email: r.email, fullName: r.full_name,
        role: r.role, isActive: r.is_active, createdAt: r.created_at,
      })));
      if (iData) setInvitations(iData.map(r => ({
        id: r.id, email: r.email, role: r.role,
        invitedByName: r.invited_by_name, status: r.status,
        expiresAt: r.expires_at, createdAt: r.created_at,
      })));
    } catch (e) {
      console.error('Team fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteError('');
    try {
      const { error } = await supabase.from('team_invitations').insert({
        email: inviteEmail,
        role: inviteRole,
        invited_by: profile?.id,
        invited_by_name: profile?.fullName || profile?.email || 'Admin',
        status: 'pending',
      });
      if (error) throw error;

      // Send invitation email
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          type: 'team_invitation',
          to: inviteEmail,
          data: {
            invitedByName: profile?.fullName || 'Admin',
            role: inviteRole,
          },
        }),
      });

      setInviteSuccess(true);
      setInviteEmail('');
      setInviteRole('cs_specialist');
      fetchData();
      setTimeout(() => { setInviteSuccess(false); setShowInviteModal(false); }, 2000);
    } catch (err: any) {
      setInviteError(err.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const revokeInvitation = async (id: string) => {
    await supabase.from('team_invitations').update({ status: 'revoked' }).eq('id', id);
    fetchData();
  };

  const toggleMemberStatus = async (id: string, current: boolean) => {
    await supabase.from('user_profiles').update({ is_active: !current }).eq('id', id);
    fetchData();
  };

  const filteredMembers = members.filter(m =>
    !search ||
    m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: members.length,
    active: members.filter(m => m.isActive).length,
    pending: invitations.filter(i => i.status === 'pending').length,
  };

  return (
    <AppLayout title="Team Management" subtitle="Manage team members, roles, and invitations">
      <div className="space-y-5">
        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Members', value: stats.total, color: 'text-foreground', bg: 'bg-muted' },
            { label: 'Active', value: stats.active, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Pending Invites', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-border`}>
              <p className={`text-2xl font-800 tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(['members', 'invitations'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-600 transition-all ${
                  activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'members' ? `Team Members (${members.length})` : `Invitations (${invitations.length})`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search members…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs rounded-lg border border-border bg-card outline-none focus:ring-2 focus:ring-primary/30 w-48"
              />
            </div>
            <button onClick={fetchData} className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-600 rounded-lg hover:opacity-90 transition-all"
              >
                <UserPlus size={13} />
                Invite Member
              </button>
            )}
          </div>
        </div>

        {/* Members Table */}
        {activeTab === 'members' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Member', 'Email', 'Role', 'Status', 'Joined', ...(isAdmin ? ['Actions'] : [])].map(h => (
                      <th key={h} className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m, i) => (
                    <tr key={m.id} className={`border-b border-border last:border-0 hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center flex-shrink-0">
                            {getInitials(m.fullName || m.email)}
                          </div>
                          <div>
                            <p className="text-xs font-700 text-foreground">{m.fullName || '—'}</p>
                            {m.id === profile?.id && <span className="text-xs text-primary font-600">You</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{m.email}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-600 px-2 py-0.5 rounded-md capitalize ${ROLE_COLORS[m.role] || 'bg-gray-100 text-gray-600'}`}>
                          {m.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-600 px-2 py-0.5 rounded-md ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {m.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(m.createdAt)}</td>
                      {isAdmin && (
                        <td className="px-5 py-3">
                          {m.id !== profile?.id && (
                            <button
                              onClick={() => toggleMemberStatus(m.id, m.isActive)}
                              className="text-xs text-muted-foreground hover:text-foreground font-600 px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-all"
                            >
                              {m.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invitations Table */}
        {activeTab === 'invitations' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {invitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Mail size={32} className="mb-3 opacity-30" />
                <p className="text-sm font-600">No invitations yet</p>
                <p className="text-xs mt-1">Invite team members to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {['Email', 'Role', 'Invited By', 'Status', 'Expires', ...(isAdmin ? ['Actions'] : [])].map(h => (
                        <th key={h} className="text-left text-xs font-600 text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((inv, i) => (
                      <tr key={inv.id} className={`border-b border-border last:border-0 hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                        <td className="px-5 py-3 text-xs font-600 text-foreground">{inv.email}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-600 px-2 py-0.5 rounded-md capitalize ${ROLE_COLORS[inv.role] || 'bg-gray-100 text-gray-600'}`}>
                            {inv.role.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{inv.invitedByName || '—'}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-600 px-2 py-0.5 rounded-md ${
                            inv.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            inv.status === 'accepted'? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(inv.expiresAt)}</td>
                        {isAdmin && (
                          <td className="px-5 py-3">
                            {inv.status === 'pending' && (
                              <button
                                onClick={() => revokeInvitation(inv.id)}
                                className="text-xs text-red-600 hover:text-red-700 font-600 px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-all"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <UserPlus size={16} className="text-primary" />
                  <h3 className="text-sm font-700 text-foreground">Invite Team Member</h3>
                </div>
                <button onClick={() => { setShowInviteModal(false); setInviteError(''); setInviteSuccess(false); }} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleInvite} className="p-6 space-y-4">
                {inviteSuccess ? (
                  <div className="flex flex-col items-center py-6 gap-3">
                    <CheckCircle size={40} className="text-green-600" />
                    <p className="text-sm font-700 text-foreground">Invitation sent!</p>
                    <p className="text-xs text-muted-foreground">An email has been sent to {inviteEmail}</p>
                  </div>
                ) : (
                  <>
                    {inviteError && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                        <AlertCircle size={13} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700">{inviteError}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-600 text-foreground mb-1.5">Email address</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        required
                        placeholder="colleague@company.com"
                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-600 text-foreground mb-1.5">Role</label>
                      <select
                        value={inviteRole}
                        onChange={e => setInviteRole(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      >
                        {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        An invitation email will be sent to this address. The invite expires in 7 days.
                      </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-600 text-muted-foreground hover:bg-muted transition-all">
                        Cancel
                      </button>
                      <button type="submit" disabled={inviting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-600 hover:opacity-90 disabled:opacity-60 transition-all">
                        {inviting ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Mail size={14} />}
                        {inviting ? 'Sending…' : 'Send Invitation'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
