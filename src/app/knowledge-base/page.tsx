'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { BookOpen, AlertTriangle, GraduationCap, ArrowUpCircle, TrendingUp, ChevronRight, Clock } from 'lucide-react';

interface KBArticle {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  iconBg: string;
  summary: string;
  readTime: string;
  tags: string[];
  content: string[];
}

const articles: KBArticle[] = [
  {
    id: 'kb-001',
    title: 'How to Handle Stalled IT Contacts',
    category: 'Risk Management',
    icon: <AlertTriangle size={18} />,
    iconBg: 'bg-red-100 text-red-600',
    summary: 'Step-by-step protocol for re-engaging unresponsive IT stakeholders and unblocking account provisioning.',
    readTime: '4 min read',
    tags: ['IT Contacts', 'Escalation', 'Account Setup'],
    content: [
      'Day 1–3: Send initial outreach via email and Slack. CC the customer\'s primary business contact.',
      'Day 4–7: Escalate to the customer\'s executive sponsor. Request an IT introduction meeting.',
      'Day 8–10: Engage your internal Account Executive to apply commercial pressure if needed.',
      'Day 11+: Raise a risk flag in COIS and notify the Operations Director. Consider a formal delay notice.',
    ],
  },
  {
    id: 'kb-002',
    title: 'Training Delivery Standards',
    category: 'Onboarding Process',
    icon: <GraduationCap size={18} />,
    iconBg: 'bg-blue-100 text-blue-600',
    summary: 'Standardized training delivery framework that reduces average training stage duration by 34%.',
    readTime: '6 min read',
    tags: ['Training', 'Best Practice', 'Efficiency'],
    content: [
      'Use the Solaris Training Template for all Mid-Market and Enterprise customers — it reduces stage duration from 12.4 to 8.2 days.',
      'Schedule training in 90-minute blocks maximum. Longer sessions reduce retention and completion rates.',
      'Require a minimum of 80% user attendance before marking training complete.',
      'Send a post-training survey within 24 hours. Scores below 7/10 trigger a follow-up session.',
    ],
  },
  {
    id: 'kb-003',
    title: 'Escalation Protocols',
    category: 'Risk Management',
    icon: <ArrowUpCircle size={18} />,
    iconBg: 'bg-amber-100 text-amber-600',
    summary: 'When and how to escalate onboarding issues to management, executives, and cross-functional teams.',
    readTime: '5 min read',
    tags: ['Escalation', 'Risk', 'Process'],
    content: [
      'Level 1 (Manager): Any milestone delayed by 3+ days, customer unresponsive for 5+ days.',
      'Level 2 (Director): Revenue at risk >$50K, Go Live delayed by 7+ days, customer threatening churn.',
      'Level 3 (Executive): Revenue at risk >$200K, legal or compliance issues, customer escalation to C-suite.',
      'Always document escalations in COIS with a timestamp, reason, and expected resolution date.',
    ],
  },
  {
    id: 'kb-004',
    title: 'Expansion Playbook',
    category: 'Growth',
    icon: <TrendingUp size={18} />,
    iconBg: 'bg-green-100 text-green-600',
    summary: 'Identify and act on expansion signals during onboarding to increase ARR within 90 days of Go Live.',
    readTime: '7 min read',
    tags: ['Expansion', 'Revenue', 'Customer Success'],
    content: [
      'Monitor health scores above 85 during the Go Live and Handoff stages — these are prime expansion candidates.',
      'Schedule an expansion discovery call within 2 weeks of Go Live for customers with >90 health scores.',
      'Look for usage signals: teams requesting additional seats, feature requests, or high login frequency.',
      'Coordinate with Account Executives early — CS and Sales alignment increases expansion close rates by 60%.',
    ],
  },
  {
    id: 'kb-005',
    title: 'Customer Health Score Interpretation',
    category: 'Analytics',
    icon: <BookOpen size={18} />,
    iconBg: 'bg-purple-100 text-purple-600',
    summary: 'How to read, interpret, and act on customer health scores to prevent churn and accelerate onboarding.',
    readTime: '5 min read',
    tags: ['Health Score', 'Analytics', 'Churn Prevention'],
    content: [
      'Excellent (80–100): Customer is on track. Schedule regular check-ins and look for expansion opportunities.',
      'Good (60–79): Monitor closely. Identify any stalled milestones and proactively address blockers.',
      'Fair (40–59): Intervention required. Schedule a stakeholder call within 48 hours.',
      'Poor (0–39): Critical risk. Escalate immediately to Director level. Prepare a recovery plan.',
    ],
  },
  {
    id: 'kb-006',
    title: 'Go Live Readiness Checklist',
    category: 'Onboarding Process',
    icon: <BookOpen size={18} />,
    iconBg: 'bg-indigo-100 text-indigo-600',
    summary: 'Complete pre-launch verification checklist to ensure smooth Go Live and minimize post-launch support tickets.',
    readTime: '3 min read',
    tags: ['Go Live', 'Checklist', 'Launch'],
    content: [
      'Technical: All integrations tested, SSO configured, data migration validated, performance benchmarks met.',
      'User Readiness: >80% of users trained, admin users certified, support contacts documented.',
      'Process: Escalation contacts confirmed, SLA terms reviewed, success metrics agreed upon.',
      'Communication: Go Live announcement drafted, internal stakeholders notified, CS handoff scheduled.',
    ],
  },
];

export default function KnowledgeBasePage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AppLayout title="Knowledge Base" subtitle="Onboarding best practices, protocols, and playbooks">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {articles.map(article => (
            <div key={article.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${article.iconBg}`}>
                    {article.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground font-500">{article.category}</span>
                    <h3 className="text-sm font-700 text-foreground leading-tight mt-0.5">{article.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{article.summary}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {article.tags.map(tag => (
                    <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">{tag}</span>
                  ))}
                </div>
              </div>

              {expanded === article.id && (
                <div className="px-5 pb-4 border-t border-border pt-4 bg-muted/30">
                  <ul className="space-y-2">
                    {article.content.map((line, i) => (
                      <li key={i} className="flex gap-2 text-xs text-foreground leading-relaxed">
                        <span className="text-primary font-700 flex-shrink-0 mt-0.5">→</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={11} />
                  <span>{article.readTime}</span>
                </div>
                <button
                  onClick={() => setExpanded(expanded === article.id ? null : article.id)}
                  className="flex items-center gap-1 text-xs text-primary font-600 hover:underline"
                >
                  {expanded === article.id ? 'Collapse' : 'Read Article'}
                  <ChevronRight size={11} className={`transition-transform ${expanded === article.id ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
