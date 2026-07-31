'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { Sparkles, Send, User, RotateCcw, History, Plus, Trash2, ChevronLeft } from 'lucide-react';
import { useChat } from '@/lib/hooks/useChat';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
}

const SYSTEM_PROMPT = `You are the COIS AI Assistant — an intelligent Customer Onboarding Intelligence System for a B2B SaaS platform. You help Customer Success Managers analyze customer risk, track onboarding progress, and recommend actions.

You have expertise in:
- Customer health scoring and risk assessment
- Onboarding stage analysis (Contract Signed → Kickoff → Account Setup → Configuration → Training → First Login → First Value → Go Live → Handoff)
- Time-to-Value (TTV) optimization
- SLA compliance and escalation management
- Portfolio-level analytics and reporting

Always be concise, data-driven, and action-oriented. Format responses with clear sections using **bold** for headers and bullet points for lists.`;

const suggestedPrompts = [
  { id: 'sp-1', text: 'Which customers are most at risk this week?' },
  { id: 'sp-2', text: 'Summarize onboarding performance for Q1 2026' },
  { id: 'sp-3', text: 'What actions should I take today?' },
];

const initialWelcome: Message = {
  id: 'msg-0',
  role: 'assistant',
  content: "Hello! I'm your COIS AI Assistant powered by OpenAI. I can help you analyze customer risk, summarize onboarding performance, and recommend actions. Select a suggested prompt below or type your own question.",
  timestamp: '',
};

function formatContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-700 text-foreground mt-2 first:mt-0">{line.replace(/\*\*/g, '')}</p>;
    }
    if (line.startsWith('• ') || line.startsWith('- ')) {
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
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{ ...initialWelcome, timestamp: '' }]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { user } = useAuth();

  const { response, isLoading, error, sendMessage } = useChat('OPEN_AI', 'gpt-4o-mini', true);

  // Track the last streamed response to persist it
  const lastResponseRef = useRef('');
  const pendingUserMsgRef = useRef<Message | null>(null);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Update streaming message in real-time
  useEffect(() => {
    if (isLoading && response) {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.id === 'streaming') {
          return [...prev.slice(0, -1), { ...last, content: response }];
        }
        return [...prev, {
          id: 'streaming',
          role: 'assistant',
          content: response,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        }];
      });
      lastResponseRef.current = response;
    }
  }, [response, isLoading]);

  // Finalize streaming message and persist
  useEffect(() => {
    if (!isLoading && lastResponseRef.current) {
      const finalContent = lastResponseRef.current;
      const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const finalMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: finalContent,
        timestamp: ts,
      };
      setMessages(prev => {
        const withoutStreaming = prev.filter(m => m.id !== 'streaming');
        return [...withoutStreaming, finalMsg];
      });
      lastResponseRef.current = '';

      // Persist to Supabase
      if (user && pendingUserMsgRef.current) {
        persistMessages(pendingUserMsgRef.current, finalMsg);
        pendingUserMsgRef.current = null;
      }
    }
  }, [isLoading]);

  const getOrCreateSession = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    if (sessionId) return sessionId;

    try {
      const { data, error: err } = await supabase
        .from('ai_chat_sessions')
        .insert({ user_id: user.id, title: 'New Conversation', model: 'gpt-4o-mini' })
        .select('id')
        .single();
      if (err) throw err;
      setSessionId(data.id);
      return data.id;
    } catch {
      return null;
    }
  }, [user, sessionId, supabase]);

  const persistMessages = async (userMsg: Message, assistantMsg: Message) => {
    try {
      const sid = await getOrCreateSession();
      if (!sid) return;

      await supabase.from('ai_chat_messages').insert([
        { session_id: sid, role: 'user', content: userMsg.content, metadata: { timestamp: userMsg.timestamp } },
        { session_id: sid, role: 'assistant', content: assistantMsg.content, metadata: { timestamp: assistantMsg.timestamp } },
      ]);

      // Log session event
      if (user) {
        await supabase.from('ai_session_logs').insert({
          session_id: sid,
          user_id: user.id,
          event_type: 'message_exchange',
          payload: { user_query: userMsg.content, response_length: assistantMsg.content.length },
        });
      }

      // Update session title from first user message
      if (messages.filter(m => m.role === 'user').length === 0) {
        const title = userMsg.content.slice(0, 60) + (userMsg.content.length > 60 ? '…' : '');
        await supabase.from('ai_chat_sessions').update({ title }).eq('id', sid);
      }
    } catch {
      // Silent fail — chat still works without persistence
    }
  };

  const loadSessions = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const { data } = await supabase
        .from('ai_chat_sessions')
        .select('id, title, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);
      setSessions(data || []);
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadSession = async (sid: string) => {
    try {
      const { data } = await supabase
        .from('ai_chat_messages')
        .select('id, role, content, metadata, created_at')
        .eq('session_id', sid)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        const loaded: Message[] = data.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.metadata?.timestamp || '',
        }));
        setMessages([{ ...initialWelcome, timestamp: '' }, ...loaded]);
        setSessionId(sid);
        setShowHistory(false);
      }
    } catch {
      toast.error('Failed to load conversation');
    }
  };

  const deleteSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase.from('ai_chat_sessions').delete().eq('id', sid);
      setSessions(prev => prev.filter(s => s.id !== sid));
      if (sessionId === sid) {
        startNewChat();
      }
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  const startNewChat = () => {
    setMessages([{ ...initialWelcome, timestamp: '' }]);
    setSessionId(null);
    setShowHistory(false);
    lastResponseRef.current = '';
    pendingUserMsgRef.current = null;
  };

  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return;

    const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: `msg-${Date.now()}`, role: 'user', content: text, timestamp: ts };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    pendingUserMsgRef.current = userMsg;

    // Build conversation history for context (last 10 messages)
    const history = messages
      .filter(m => m.id !== 'msg-0')
      .slice(-10)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    sendMessage(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: text },
      ],
      { max_completion_tokens: 1024 }
    );
  };

  return (
    <ErrorBoundary>
      <AppLayout title="AI Assistant" subtitle="Powered by OpenAI · context-aware · portfolio intelligence">
        <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[720px]">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadSessions(); }}
                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-muted border border-border text-muted-foreground rounded-lg hover:text-foreground transition-colors"
              >
                <History size={13} />
                <span className="hidden sm:inline">History</span>
              </button>
              <button
                onClick={startNewChat}
                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-primary/5 border border-primary/20 text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Plus size={13} />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-700 font-600">Live AI</span>
            </div>
          </div>

          {/* History panel */}
          {showHistory && (
            <div className="mb-3 bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <span className="text-xs font-700 text-foreground">Recent Conversations</span>
                <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft size={14} />
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-border">
                {historyLoading ? (
                  <div className="px-4 py-3 text-xs text-muted-foreground">Loading…</div>
                ) : sessions.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-muted-foreground">
                    {user ? 'No saved conversations yet.' : 'Sign in to save chat history.'}
                  </div>
                ) : sessions.map(s => (
                  <div
                    key={s.id}
                    onClick={() => loadSession(s.id)}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-600 text-foreground truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.updated_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={(e) => deleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all ml-2 flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto bg-card border border-border rounded-xl mb-3 p-4 space-y-4 min-h-0">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-700 ${
                  msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {msg.role === 'assistant' ? <Sparkles size={13} /> : <User size={13} />}
                </div>
                <div className={`max-w-[85%] sm:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === 'assistant' ?'bg-muted/50 text-foreground border border-border' :'bg-primary text-primary-foreground'
                  }`}>
                    {msg.role === 'assistant' ? formatContent(msg.content) : <p>{msg.content}</p>}
                  </div>
                  {msg.timestamp && (
                    <span className="text-xs text-muted-foreground mt-1 px-1">{msg.timestamp}</span>
                  )}
                </div>
              </div>
            ))}
            {isLoading && !response && (
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
                onClick={() => handleSend(p.text)}
                disabled={isLoading}
                className="text-xs px-3 py-2 bg-primary/5 border border-primary/20 text-primary rounded-lg hover:bg-primary/10 transition-all duration-150 font-500 disabled:opacity-50"
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
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
              placeholder="Ask about customer risk, onboarding performance, or recommended actions…"
              disabled={isLoading}
              className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 min-w-0"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={16} />
            </button>
            <button
              onClick={startNewChat}
              className="px-3 py-3 bg-muted text-muted-foreground rounded-xl hover:text-foreground transition-all duration-150 flex-shrink-0"
              title="Reset conversation"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </AppLayout>
    </ErrorBoundary>
  );
}
