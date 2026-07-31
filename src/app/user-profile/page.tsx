'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { User, Bell, Download, Mail, Camera, Save, Check, Globe, Webhook, FileText, FileSpreadsheet, Clock, AlertTriangle, CheckCircle2, Info, Zap, ToggleLeft, ToggleRight,  } from 'lucide-react';

type Tab = 'profile' | 'notifications' | 'export' | 'email';

interface ProfileData {
  fullName: string;
  email: string;
  role: string;
  timezone: string;
  bio: string;
  github: string;
  linkedin: string;
}

interface NotifPrefs {
  slaBreaches: boolean;
  riskAlerts: boolean;
  milestoneUpdates: boolean;
  pipelineFailures: boolean;
  deploySuccess: boolean;
  teamMentions: boolean;
  weeklyDigest: boolean;
  aiInsights: boolean;
  channels: { email: boolean; slack: boolean; inApp: boolean; webhook: boolean };
}

interface ExportSettings {
  format: 'pdf' | 'csv' | 'json' | 'xlsx';
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange: '7d' | '30d' | '90d' | 'custom';
  autoExport: boolean;
  autoExportDay: string;
  watermark: boolean;
  compression: boolean;
}

interface EmailConfig {
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'never';
  digestTime: string;
  digestDay: string;
  riskThreshold: 'all' | 'high' | 'critical';
  includeCharts: boolean;
  includeRecommendations: boolean;
  ccList: string;
  unsubscribeAll: boolean;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={15} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
  { id: 'export', label: 'Export Settings', icon: <Download size={15} /> },
  { id: 'email', label: 'Email Frequency', icon: <Mail size={15} /> },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex-shrink-0 transition-colors">
      {on
        ? <ToggleRight size={22} className="text-primary" />
        : <ToggleLeft size={22} className="text-muted-foreground" />}
    </button>
  );
}

function SaveBanner({ saved }: { saved: boolean }) {
  if (!saved) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700">
      <Check size={13} /> Changes saved successfully
    </div>
  );
}

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'Lavish Pandey',
    email: 'lavish@cois-platform.dev',
    role: 'Business Analyst · Full-Stack Engineer',
    timezone: 'Asia/Kolkata',
    bio: 'Building COIS — a B2B SaaS platform for customer success teams. Passionate about DevOps, real-time analytics, and AI-powered insights.',
    github: 'lavishpandey67',
    linkedin: 'lavishpandey',
  });

  const [notif, setNotif] = useState<NotifPrefs>({
    slaBreaches: true,
    riskAlerts: true,
    milestoneUpdates: true,
    pipelineFailures: true,
    deploySuccess: false,
    teamMentions: true,
    weeklyDigest: true,
    aiInsights: false,
    channels: { email: true, slack: false, inApp: true, webhook: false },
  });

  const [exportCfg, setExportCfg] = useState<ExportSettings>({
    format: 'pdf',
    includeCharts: true,
    includeRawData: false,
    dateRange: '30d',
    autoExport: false,
    autoExportDay: 'monday',
    watermark: true,
    compression: false,
  });

  const [emailCfg, setEmailCfg] = useState<EmailConfig>({
    frequency: 'daily',
    digestTime: '08:00',
    digestDay: 'monday',
    riskThreshold: 'high',
    includeCharts: true,
    includeRecommendations: true,
    ccList: '',
    unsubscribeAll: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleNotif = (key: keyof Omit<NotifPrefs, 'channels'>) =>
    setNotif(p => ({ ...p, [key]: !p[key] }));

  const toggleChannel = (key: keyof NotifPrefs['channels']) =>
    setNotif(p => ({ ...p, channels: { ...p.channels, [key]: !p.channels[key] } }));

  const toggleExport = (key: keyof Pick<ExportSettings, 'includeCharts' | 'includeRawData' | 'autoExport' | 'watermark' | 'compression'>) =>
    setExportCfg(p => ({ ...p, [key]: !p[key] }));

  const toggleEmail = (key: keyof Pick<EmailConfig, 'includeCharts' | 'includeRecommendations' | 'unsubscribeAll'>) =>
    setEmailCfg(p => ({ ...p, [key]: !p[key] }));

  return (
    <AppLayout title="User Profile" subtitle="Manage your account, preferences, and notification settings">
      <div className="max-w-4xl space-y-5">

        {/* Tab Bar */}
        <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-xl p-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Avatar + name */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start gap-5">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-xl font-black">
                    LP
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:opacity-80 transition-opacity">
                    <Camera size={11} />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-foreground">{profile.fullName}</p>
                  <p className="text-sm text-muted-foreground">{profile.role}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'fullName' as const, type: 'text' },
                  { label: 'Email Address', key: 'email' as const, type: 'email' },
                  { label: 'Role / Title', key: 'role' as const, type: 'text' },
                  { label: 'GitHub Username', key: 'github' as const, type: 'text' },
                  { label: 'LinkedIn Handle', key: 'linkedin' as const, type: 'text' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={profile[field.key]}
                      onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Timezone</label>
                  <select
                    value={profile.timezone}
                    onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  >
                    {['Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'].map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <SaveBanner saved={saved} />
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-opacity ml-auto"
              >
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {/* Alert types */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
                <Bell size={14} className="text-primary" />
                <span className="text-sm font-bold text-foreground">Alert Types</span>
              </div>
              <div className="divide-y divide-border">
                {[
                  { key: 'slaBreaches' as const, label: 'SLA Breaches', desc: 'Notify when a customer SLA is breached or at risk', icon: <AlertTriangle size={14} className="text-red-500" /> },
                  { key: 'riskAlerts' as const, label: 'Risk Alerts', desc: 'Critical and high-priority risk flags on customers', icon: <AlertTriangle size={14} className="text-amber-500" /> },
                  { key: 'milestoneUpdates' as const, label: 'Milestone Updates', desc: 'Completed, delayed, or upcoming milestone events', icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
                  { key: 'pipelineFailures' as const, label: 'Pipeline Failures', desc: 'CI/CD build failures and deployment errors', icon: <Zap size={14} className="text-red-500" /> },
                  { key: 'deploySuccess' as const, label: 'Deploy Success', desc: 'Successful production deployments', icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
                  { key: 'teamMentions' as const, label: 'Team Mentions', desc: 'When you are mentioned in comments or tasks', icon: <User size={14} className="text-blue-500" /> },
                  { key: 'weeklyDigest' as const, label: 'Weekly Digest', desc: 'Summary of all activity from the past week', icon: <Info size={14} className="text-violet-500" /> },
                  { key: 'aiInsights' as const, label: 'AI Insights', desc: 'Proactive AI-generated recommendations', icon: <Zap size={14} className="text-violet-500" /> },
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                    <div className="flex-shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Toggle on={notif[item.key]} onToggle={() => toggleNotif(item.key)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery channels */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
                <Globe size={14} className="text-primary" />
                <span className="text-sm font-bold text-foreground">Delivery Channels</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
                {[
                  { key: 'email' as const, label: 'Email', desc: 'Receive alerts via email', icon: <Mail size={15} className="text-blue-500" /> },
                  { key: 'slack' as const, label: 'Slack', desc: 'Push to connected Slack workspace', icon: <Globe size={15} className="text-violet-500" /> },
                  { key: 'inApp' as const, label: 'In-App', desc: 'Show in notification bell', icon: <Bell size={15} className="text-emerald-500" /> },
                  { key: 'webhook' as const, label: 'Webhook', desc: 'POST to custom endpoint', icon: <Webhook size={15} className="text-amber-500" /> },
                ].map(ch => (
                  <div key={ch.key} className="flex items-center gap-3 px-5 py-4">
                    {ch.icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{ch.label}</p>
                      <p className="text-xs text-muted-foreground">{ch.desc}</p>
                    </div>
                    <Toggle on={notif.channels[ch.key]} onToggle={() => toggleChannel(ch.key)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
                <Save size={14} /> Save Preferences
              </button>
            </div>
            <SaveBanner saved={saved} />
          </div>
        )}

        {/* ── EXPORT SETTINGS TAB ── */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
                <Download size={14} className="text-primary" />
                <span className="text-sm font-bold text-foreground">Default Export Format</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { val: 'pdf' as const, label: 'PDF', icon: <FileText size={18} />, desc: 'Formatted report' },
                    { val: 'csv' as const, label: 'CSV', icon: <FileSpreadsheet size={18} />, desc: 'Raw data rows' },
                    { val: 'json' as const, label: 'JSON', icon: <FileText size={18} />, desc: 'API-ready data' },
                    { val: 'xlsx' as const, label: 'Excel', icon: <FileSpreadsheet size={18} />, desc: 'Spreadsheet' },
                  ].map(fmt => (
                    <button
                      key={fmt.val}
                      onClick={() => setExportCfg(p => ({ ...p, format: fmt.val }))}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        exportCfg.format === fmt.val
                          ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {fmt.icon}
                      <span className="text-sm font-bold">{fmt.label}</span>
                      <span className="text-xs">{fmt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
                <Clock size={14} className="text-primary" />
                <span className="text-sm font-bold text-foreground">Default Date Range</span>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: '7d' as const, label: 'Last 7 days' },
                    { val: '30d' as const, label: 'Last 30 days' },
                    { val: '90d' as const, label: 'Last 90 days' },
                    { val: 'custom' as const, label: 'Custom range' },
                  ].map(r => (
                    <button
                      key={r.val}
                      onClick={() => setExportCfg(p => ({ ...p, dateRange: r.val }))}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        exportCfg.dateRange === r.val
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <span className="text-sm font-bold text-foreground">Export Options</span>
              </div>
              <div className="divide-y divide-border">
                {[
                  { key: 'includeCharts' as const, label: 'Include Charts', desc: 'Embed chart images in PDF exports' },
                  { key: 'includeRawData' as const, label: 'Include Raw Data', desc: 'Append raw data tables to reports' },
                  { key: 'watermark' as const, label: 'Add Watermark', desc: 'Stamp COIS watermark on exported PDFs' },
                  { key: 'compression' as const, label: 'Compress Output', desc: 'Reduce file size for large exports' },
                  { key: 'autoExport' as const, label: 'Auto-Export Weekly', desc: 'Automatically export and email every week' },
                ].map(opt => (
                  <div key={opt.key} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                    <Toggle on={exportCfg[opt.key]} onToggle={() => toggleExport(opt.key)} />
                  </div>
                ))}
              </div>
              {exportCfg.autoExport && (
                <div className="px-5 py-4 bg-muted/30 border-t border-border">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Auto-export day</label>
                  <select
                    value={exportCfg.autoExportDay}
                    onChange={e => setExportCfg(p => ({ ...p, autoExportDay: e.target.value }))}
                    className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  >
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(d => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
                <Save size={14} /> Save Export Settings
              </button>
            </div>
            <SaveBanner saved={saved} />
          </div>
        )}

        {/* ── EMAIL FREQUENCY TAB ── */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
                <Mail size={14} className="text-primary" />
                <span className="text-sm font-bold text-foreground">Email Digest Frequency</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { val: 'realtime' as const, label: 'Real-time', desc: 'Instant' },
                    { val: 'hourly' as const, label: 'Hourly', desc: 'Batched' },
                    { val: 'daily' as const, label: 'Daily', desc: 'Digest' },
                    { val: 'weekly' as const, label: 'Weekly', desc: 'Summary' },
                    { val: 'never' as const, label: 'Never', desc: 'Off' },
                  ].map(f => (
                    <button
                      key={f.val}
                      onClick={() => setEmailCfg(p => ({ ...p, frequency: f.val }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                        emailCfg.frequency === f.val
                          ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      <span className="text-sm font-bold">{f.label}</span>
                      <span className="text-xs">{f.desc}</span>
                    </button>
                  ))}
                </div>

                {(emailCfg.frequency === 'daily' || emailCfg.frequency === 'weekly') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Digest send time</label>
                      <input
                        type="time"
                        value={emailCfg.digestTime}
                        onChange={e => setEmailCfg(p => ({ ...p, digestTime: e.target.value }))}
                        className="px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      />
                    </div>
                    {emailCfg.frequency === 'weekly' && (
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Send on day</label>
                        <select
                          value={emailCfg.digestDay}
                          onChange={e => setEmailCfg(p => ({ ...p, digestDay: e.target.value }))}
                          className="px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        >
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(d => (
                            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <span className="text-sm font-bold text-foreground">Alert Threshold</span>
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-3">Only send email alerts for risks at or above this severity level</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: 'all' as const, label: 'All alerts', color: 'text-blue-600' },
                    { val: 'high' as const, label: 'High + Critical', color: 'text-amber-600' },
                    { val: 'critical' as const, label: 'Critical only', color: 'text-red-600' },
                  ].map(t => (
                    <button
                      key={t.val}
                      onClick={() => setEmailCfg(p => ({ ...p, riskThreshold: t.val }))}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                        emailCfg.riskThreshold === t.val
                          ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <span className="text-sm font-bold text-foreground">Email Content</span>
              </div>
              <div className="divide-y divide-border">
                {[
                  { key: 'includeCharts' as const, label: 'Include Charts', desc: 'Embed inline chart images in digest emails' },
                  { key: 'includeRecommendations' as const, label: 'AI Recommendations', desc: 'Include AI-generated action items in digest' },
                ].map(opt => (
                  <div key={opt.key} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                    <Toggle on={emailCfg[opt.key]} onToggle={() => toggleEmail(opt.key)} />
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-border">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">CC list (comma-separated emails)</label>
                <input
                  type="text"
                  placeholder="manager@company.com, team@company.com"
                  value={emailCfg.ccList}
                  onChange={e => setEmailCfg(p => ({ ...p, ccList: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-red-700">Unsubscribe from all emails</p>
                <p className="text-xs text-red-600 mt-0.5">You will stop receiving all email notifications from COIS</p>
              </div>
              <Toggle on={emailCfg.unsubscribeAll} onToggle={() => toggleEmail('unsubscribeAll')} />
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
                <Save size={14} /> Save Email Settings
              </button>
            </div>
            <SaveBanner saved={saved} />
          </div>
        )}

      </div>
    </AppLayout>
  );
}
