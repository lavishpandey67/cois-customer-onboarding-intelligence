'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { useAuth, ROLE_ACCESS } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  GitBranch,
  Flag,
  BookOpen,
  BarChart2,
  TrendingUp,
  Bell,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  Lock,
  Shield,
  Clock,
  UserCog,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  group: string;
}

const navItems: NavItem[] = [
  { id: 'nav-dashboard', label: 'Executive Dashboard', href: '/', icon: <LayoutDashboard size={18} />, group: 'core' },
  { id: 'nav-customers', label: 'Customer Management', href: '/customer-management', icon: <Users size={18} />, badge: 4, group: 'core' },
  { id: 'nav-tasks', label: 'Task Management', href: '/task-management', icon: <CheckSquare size={18} />, badge: 5, group: 'core' },
  { id: 'nav-timeline', label: 'Customer Timeline', href: '/customer-timeline', icon: <GitBranch size={18} />, group: 'core' },
  { id: 'nav-milestones', label: 'Milestones', href: '/milestones', icon: <Flag size={18} />, group: 'core' },
  { id: 'nav-sla', label: 'SLA Tracker', href: '/sla-tracker', icon: <Clock size={18} />, group: 'core' },
  { id: 'nav-knowledge', label: 'Knowledge Base', href: '/knowledge-base', icon: <BookOpen size={18} />, group: 'insights' },
  { id: 'nav-reports', label: 'Reports', href: '/reports', icon: <BarChart2 size={18} />, group: 'insights' },
  { id: 'nav-analytics', label: 'Analytics', href: '/analytics', icon: <TrendingUp size={18} />, group: 'insights' },
  { id: 'nav-ai', label: 'AI Assistant', href: '/ai-assistant', icon: <Sparkles size={18} />, group: 'insights' },
  { id: 'nav-notifications', label: 'Notifications', href: '/notifications', icon: <Bell size={18} />, badge: 8, group: 'system' },
  { id: 'nav-audit', label: 'Audit Log', href: '/audit-log', icon: <Shield size={18} />, group: 'system' },
  { id: 'nav-team', label: 'Team Management', href: '/team-management', icon: <UserCog size={18} />, group: 'system' },
  { id: 'nav-admin', label: 'Administration', href: '/administration', icon: <Settings size={18} />, group: 'system' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut, roleLabel, initials } = useAuth();

  const groups = [
    { key: 'core', label: 'Operations' },
    { key: 'insights', label: 'Insights' },
    { key: 'system', label: 'System' },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const isAccessible = (href: string): boolean => {
    if (!profile) return false;
    const allowedRoles = ROLE_ACCESS[href];
    if (!allowedRoles) return true;
    return allowedRoles.includes(profile.role);
  };

  return (
    <aside
      className={`relative flex flex-col bg-card border-r border-border h-screen sticky top-0 sidebar-transition overflow-hidden ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-border px-4 gap-3 flex-shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}>
        <AppLogo size={28} />
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-bold text-sm text-foreground tracking-tight block leading-tight">COIS</span>
            <span className="text-xs text-muted-foreground leading-tight block truncate">B2B SaaS Platform — Demo Environment</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {groups.map((group) => {
          const groupItems = navItems.filter((n) => n.group === group.key);
          return (
            <div key={`group-${group.key}`} className="mb-4">
              {!collapsed && (
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider px-2 mb-1">{group.label}</p>
              )}
              {collapsed && <div className="border-t border-border mb-2 mx-1" />}
              {groupItems.map((item) => {
                const accessible = isAccessible(item.href);
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href) && item.href !== '#';
                if (!accessible) {
                  return (
                    <div
                      key={item.id}
                      title={collapsed ? `${item.label} (No access)` : undefined}
                      className={`flex items-center gap-3 px-2 py-2 rounded-lg mb-0.5 text-sm opacity-40 cursor-not-allowed ${collapsed ? 'justify-center' : ''}`}
                    >
                      <span className="flex-shrink-0 text-muted-foreground">{item.icon}</span>
                      {!collapsed && <span className="flex-1 truncate text-muted-foreground">{item.label}</span>}
                      {!collapsed && <Lock size={11} className="text-muted-foreground" />}
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-2 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group relative ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-secondary-foreground hover:bg-muted hover:text-foreground'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.badge !== undefined && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs font-600 rounded-full px-1.5 py-0.5 leading-none tabular-nums">{item.badge}</span>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-2 flex-shrink-0">
        <button
          className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Help & Support' : undefined}
        >
          <HelpCircle size={18} />
          {!collapsed && <span>Help & Support</span>}
        </button>
        <div className={`flex items-center gap-2.5 px-2 py-2 mt-1 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-700 flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-600 text-foreground truncate">{profile?.fullName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleSignOut} title="Sign out" className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 z-10 shadow-sm"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}