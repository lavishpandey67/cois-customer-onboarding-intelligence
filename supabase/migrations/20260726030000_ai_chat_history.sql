-- AI Chat History & Session Logs (NoSQL layer via JSONB)
-- Migration: 20260726030000_ai_chat_history.sql

-- ============================================================
-- 1. AI Chat Sessions table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. AI Chat Messages table (JSONB for flexible message content)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. Session Logs table (audit trail for AI interactions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.ai_chat_sessions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_id ON public.ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_updated_at ON public.ai_chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session_id ON public.ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created_at ON public.ai_chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_session_logs_session_id ON public.ai_session_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_session_logs_user_id ON public.ai_session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_metadata ON public.ai_chat_messages USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_ai_session_logs_payload ON public.ai_session_logs USING gin(payload);

-- ============================================================
-- 5. updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_ai_session_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================================
-- 6. Enable RLS
-- ============================================================
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_session_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. RLS Policies
-- ============================================================
DROP POLICY IF EXISTS "users_manage_own_ai_chat_sessions" ON public.ai_chat_sessions;
CREATE POLICY "users_manage_own_ai_chat_sessions"
ON public.ai_chat_sessions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_ai_chat_messages" ON public.ai_chat_messages;
CREATE POLICY "users_manage_own_ai_chat_messages"
ON public.ai_chat_messages
FOR ALL
TO authenticated
USING (
    session_id IN (
        SELECT id FROM public.ai_chat_sessions WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    session_id IN (
        SELECT id FROM public.ai_chat_sessions WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_manage_own_ai_session_logs" ON public.ai_session_logs;
CREATE POLICY "users_manage_own_ai_session_logs"
ON public.ai_session_logs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 8. Triggers
-- ============================================================
DROP TRIGGER IF EXISTS update_ai_chat_sessions_timestamp ON public.ai_chat_sessions;
CREATE TRIGGER update_ai_chat_sessions_timestamp
    BEFORE UPDATE ON public.ai_chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ai_session_timestamp();
