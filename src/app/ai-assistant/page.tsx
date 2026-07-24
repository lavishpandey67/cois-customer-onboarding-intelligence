'use client';

import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Sparkles, Send, User, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const suggestedPrompts = [
  { id: 'sp-1', text: 'Which customers are most at risk this week?' },
  { id: 'sp-2', text: 'Summarize onboarding performance for Q1 2026' },
  { id: 'sp-3', text: 'What actions should I take today?' },
];

const staticResponses: Record<string, string> = {
  'Which customers are most at risk this week?': `Based on current onboarding data, the following customers require immediate attention this week:

**🔴 Critical Risk**
• **Vantage Capital Partners** (Enterprise, $320K ARR) — Compliance approval has been pending for 18 days. Go Live is at risk. Recommend executive escalation today.
• **NorthBridge Logistics** (Enterprise, $168K ARR) — IT contact unresponsive for 14 days. Account provisioning is completely blocked. Escalate to their executive sponsor.

**🟠 High Risk**
• **Apex Retail Solutions** (Mid-Market, $96K ARR) — Training cannot proceed until customer confirms availability. Follow up with primary contact by EOD.
• **Starfield Media** (SMB, $24K ARR) — No IT contact provided. Account setup blocked at day 10.

**Recommended Actions:**
1. Schedule executive calls for Vantage Capital and NorthBridge today
2. Send formal delay notices to both Critical accounts
3. Assign backup IT contacts for Starfield Media through their business sponsor`,

  'Summarize onboarding performance for Q1 2026': `**Q1 2026 Onboarding Performance Summary**
*January – March 2026 · NovaFlow Technologies*

**Volume**
• 23 new onboardings initiated
• 15 completed (65% completion rate)
• 8 carried forward to Q2

**Time to Value**
• Average TTV: 58 days (vs 62-day Q4 2025 baseline)
• Improvement: −4 days quarter-over-quarter
• Best performer: Solaris Health Systems — 38 days TTV

**Health Scores**
• 61% of Q1 cohort achieved Excellent or Good health by Go Live
• 3 customers required recovery plans post-Go Live

**Key Wins**
• Cascade Insurance Group reached Go Live 6 days ahead of schedule
• Introduced Solaris Training Template — reduced training stage by 3.2 days on average
• Zero critical escalations in January (first time in 6 quarters)

**Areas for Improvement**
• Configuration stage remains the longest bottleneck at 11.4 avg days
• 4 customers experienced IT contact delays exceeding 10 days
• Training scheduling conflicts caused 2 Go Live delays in March`,

  'What actions should I take today?': `**Your Priority Actions for Today — Jul 24, 2026**

**🔴 Urgent (Complete by 12:00 PM)**
1. **Vantage Capital Partners** — Call Daniel Osei to confirm executive escalation status. Compliance approval is 18 days overdue.
2. **NorthBridge Logistics** — Send formal delay notice. IT unresponsive for 14 days. Loop in Lena Müller and the customer's executive sponsor.

**🟠 High Priority (Complete by EOD)**
3. **Apex Retail Solutions** — Follow up with Marcus Webb on training scheduling. Customer availability must be confirmed today.
4. **Starfield Media** — Request IT contact information from business sponsor. Account provisioning cannot proceed without it.

**🟡 Standard (This Week)**
5. **Nexus Property Group** — Check in with Aiko Tanaka on training progress. 11 days in stage with no update.
6. **Cascade Insurance Group** — Prepare Go Live announcement and schedule expansion discovery call for next week.
7. Review 3 AI Insight cards on the Executive Dashboard — mark reviewed after actioning.

**📊 Metrics Check**
• Current portfolio health: 60% Excellent/Good, 40% Fair/Poor
• 5 active risk alerts requiring owner response
• 8 unread notifications in your queue`,
};

const initialMessages: Message[] = [
  {
    id: 'msg-0',
    role: 'assistant',
    content: 'Hello! I\'m your COIS AI Assistant. I can help you analyze customer risk, summarize onboarding performance, and recommend actions. Select a suggested prompt below or type your own question.',
    timestamp: '04:14 AM',
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = staticResponses[text] ||
        `I've analyzed the current onboarding data for your query: **"${text}"**\n\nBased on the portfolio of 50 active customers, I recommend reviewing the Risk Alerts table on the Executive Dashboard for the most current status. For detailed analysis, check the Analytics and Reports sections.\n\nWould you like me to focus on a specific customer, stage, or metric?`;

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setIsTyping(false);
      setMessages(prev => [...prev, assistantMsg]);
    }, 1200);
  };

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-700 text-foreground mt-2 first:mt-0">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('• ')) {
        const parts = line.slice(2).split('**');
        return (
          <div key={i} className="flex gap-2 mt-1">
            <span className="text-primary flex-shrink-0 mt-0.5">•</span>
            <p>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>
          </div>
        );
      }
      if (/^\d+\./.test(line)) {
        const parts = line.split('**');
        return (
          <div key={i} className="flex gap-2 mt-1">
            <span className="text-primary font-600 flex-shrink-0">{line.match(/^\d+/)?.[0]}.</span>
            <p>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p.replace(/^\d+\.\s*/, ''))}</p>
          </div>
        );
      }
      if (line === '') return <div key={i} className="h-1" />;
      const parts = line.split('**');
      return <p key={i} className="mt-0.5">{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>;
    });
  };

  return (
    <AppLayout title="AI Assistant" subtitle="Powered by COIS intelligence engine · portfolio data only">
      <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[700px]">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto bg-card border border-border rounded-xl mb-4 p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-700 ${
                msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {msg.role === 'assistant' ? <Sparkles size={13} /> : <User size={13} />}
              </div>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'assistant' ?'bg-muted/50 text-foreground border border-border' :'bg-primary text-primary-foreground'
                }`}>
                  {msg.role === 'assistant' ? formatContent(msg.content) : <p>{msg.content}</p>}
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Sparkles size={13} />
              </div>
              <div className="bg-muted/50 border border-border rounded-xl px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts */}
        <div className="flex gap-2 flex-wrap mb-3">
          {suggestedPrompts.map(p => (
            <button
              key={p.id}
              onClick={() => sendMessage(p.text)}
              className="text-xs px-3 py-2 bg-primary/5 border border-primary/20 text-primary rounded-lg hover:bg-primary/10 transition-all duration-150 font-500"
            >
              {p.text}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about customer risk, onboarding performance, or recommended actions…"
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
          <button
            onClick={() => setMessages(initialMessages)}
            className="px-3 py-3 bg-muted text-muted-foreground rounded-xl hover:text-foreground transition-all duration-150"
            title="Reset conversation"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
