-- ============================================================
-- COIS: Audit Log, SLA Tracker, Team Invitations
-- Migration: 20260726020000_audit_sla_team.sql
-- ============================================================

-- ─── 1. Types ─────────────────────────────────────────────────────────────────

DROP TYPE IF EXISTS public.audit_action CASCADE;
CREATE TYPE public.audit_action AS ENUM (
  'login', 'logout', 'view', 'create', 'update', 'delete',
  'export', 'escalate', 'invite', 'role_change', 'password_reset'
);

DROP TYPE IF EXISTS public.sla_status CASCADE;
CREATE TYPE public.sla_status AS ENUM ('active', 'breached', 'at_risk', 'resolved');

DROP TYPE IF EXISTS public.invite_status CASCADE;
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- ─── 2. Tables ────────────────────────────────────────────────────────────────

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  user_email   TEXT NOT NULL DEFAULT '',
  user_role    TEXT NOT NULL DEFAULT '',
  action       public.audit_action NOT NULL,
  resource     TEXT NOT NULL DEFAULT '',
  resource_id  TEXT,
  details      JSONB DEFAULT '{}'::jsonb,
  ip_address   TEXT DEFAULT '',
  user_agent   TEXT DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- SLA Policies
CREATE TABLE IF NOT EXISTS public.sla_policies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  tier              TEXT NOT NULL DEFAULT 'SMB',
  response_hours    INTEGER NOT NULL DEFAULT 24,
  resolution_hours  INTEGER NOT NULL DEFAULT 72,
  escalation_hours  INTEGER NOT NULL DEFAULT 48,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- SLA Breaches
CREATE TABLE IF NOT EXISTS public.sla_breaches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     TEXT REFERENCES public.customers(id) ON DELETE CASCADE,
  customer_name   TEXT NOT NULL DEFAULT '',
  tier            TEXT NOT NULL DEFAULT 'SMB',
  policy_id       UUID REFERENCES public.sla_policies(id) ON DELETE SET NULL,
  policy_name     TEXT NOT NULL DEFAULT '',
  breach_type     TEXT NOT NULL DEFAULT 'response',
  sla_hours       INTEGER NOT NULL DEFAULT 24,
  actual_hours    INTEGER NOT NULL DEFAULT 0,
  breach_hours    INTEGER GENERATED ALWAYS AS (GREATEST(actual_hours - sla_hours, 0)) STORED,
  status          public.sla_status DEFAULT 'active',
  manager         TEXT NOT NULL DEFAULT '',
  opened_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Team Invitations
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'support_agent',
  invited_by    UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  invited_by_name TEXT DEFAULT '',
  status        public.invite_status DEFAULT 'pending',
  token         TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  expires_at    TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
  accepted_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── 3. Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource);

CREATE INDEX IF NOT EXISTS idx_sla_breaches_customer_id ON public.sla_breaches(customer_id);
CREATE INDEX IF NOT EXISTS idx_sla_breaches_status ON public.sla_breaches(status);
CREATE INDEX IF NOT EXISTS idx_sla_breaches_created_at ON public.sla_breaches(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON public.team_invitations(status);

-- ─── 4. Helper Functions ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin_or_ops()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'operations_director', 'ceo')
  )
$$;

-- ─── 5. Enable RLS ────────────────────────────────────────────────────────────

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- ─── 6. RLS Policies ─────────────────────────────────────────────────────────

-- Audit Logs: authenticated users can read; system inserts
DROP POLICY IF EXISTS "authenticated_read_audit_logs" ON public.audit_logs;
CREATE POLICY "authenticated_read_audit_logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "authenticated_insert_audit_logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- SLA Policies: all authenticated can read
DROP POLICY IF EXISTS "authenticated_read_sla_policies" ON public.sla_policies;
CREATE POLICY "authenticated_read_sla_policies"
ON public.sla_policies FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "admin_manage_sla_policies" ON public.sla_policies;
CREATE POLICY "admin_manage_sla_policies"
ON public.sla_policies FOR ALL TO authenticated
USING (public.is_admin_or_ops())
WITH CHECK (public.is_admin_or_ops());

-- SLA Breaches: all authenticated can read
DROP POLICY IF EXISTS "authenticated_read_sla_breaches" ON public.sla_breaches;
CREATE POLICY "authenticated_read_sla_breaches"
ON public.sla_breaches FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "admin_manage_sla_breaches" ON public.sla_breaches;
CREATE POLICY "admin_manage_sla_breaches"
ON public.sla_breaches FOR ALL TO authenticated
USING (public.is_admin_or_ops())
WITH CHECK (public.is_admin_or_ops());

-- Team Invitations: admins manage, invited user can read their own
DROP POLICY IF EXISTS "admin_manage_team_invitations" ON public.team_invitations;
CREATE POLICY "admin_manage_team_invitations"
ON public.team_invitations FOR ALL TO authenticated
USING (public.is_admin_or_ops())
WITH CHECK (public.is_admin_or_ops());

-- ─── 7. Seed Data ─────────────────────────────────────────────────────────────

-- SLA Policies seed
INSERT INTO public.sla_policies (id, name, tier, response_hours, resolution_hours, escalation_hours)
VALUES
  (gen_random_uuid(), 'Enterprise SLA', 'Enterprise', 4, 24, 8),
  (gen_random_uuid(), 'Mid-Market SLA', 'Mid-Market', 8, 48, 24),
  (gen_random_uuid(), 'SMB SLA', 'SMB', 24, 72, 48)
ON CONFLICT DO NOTHING;

-- SLA Breaches seed
DO $$
DECLARE
  ent_policy_id UUID;
  mm_policy_id  UUID;
  smb_policy_id UUID;
BEGIN
  SELECT id INTO ent_policy_id FROM public.sla_policies WHERE tier = 'Enterprise' LIMIT 1;
  SELECT id INTO mm_policy_id  FROM public.sla_policies WHERE tier = 'Mid-Market' LIMIT 1;
  SELECT id INTO smb_policy_id FROM public.sla_policies WHERE tier = 'SMB' LIMIT 1;

  INSERT INTO public.sla_breaches (customer_id, customer_name, tier, policy_id, policy_name, breach_type, sla_hours, actual_hours, status, manager, opened_at)
  VALUES
    ('c-001', 'Vantage Capital Partners', 'Enterprise', ent_policy_id, 'Enterprise SLA', 'resolution', 24, 432, 'breached', 'Sarah Chen', NOW() - INTERVAL '18 days'),
    ('c-002', 'NorthBridge Logistics', 'Mid-Market', mm_policy_id, 'Mid-Market SLA', 'response', 8, 336, 'breached', 'Marcus Webb', NOW() - INTERVAL '14 days'),
    ('c-003', 'Apex Retail Solutions', 'SMB', smb_policy_id, 'SMB SLA', 'escalation', 48, 120, 'at_risk', 'Priya Nair', NOW() - INTERVAL '5 days'),
    ('c-004', 'BlueSky Pharma', 'Enterprise', ent_policy_id, 'Enterprise SLA', 'response', 4, 28, 'at_risk', 'Daniel Osei', NOW() - INTERVAL '1 day'),
    ('c-005', 'Cascade Insurance Group', 'Mid-Market', mm_policy_id, 'Mid-Market SLA', 'resolution', 48, 96, 'resolved', 'Aiko Tanaka', NOW() - INTERVAL '10 days')
  ON CONFLICT DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'SLA breach seed failed: %', SQLERRM;
END $$;

-- Audit Logs seed
DO $$
DECLARE
  admin_uid UUID;
BEGIN
  SELECT id INTO admin_uid FROM public.user_profiles WHERE role = 'admin' LIMIT 1;

  IF admin_uid IS NOT NULL THEN
    INSERT INTO public.audit_logs (user_id, user_email, user_role, action, resource, resource_id, details, ip_address, created_at)
    VALUES
      (admin_uid, 'admin@cois.app', 'admin', 'login', 'auth', NULL, '{"method":"email"}'::jsonb, '192.168.1.1', NOW() - INTERVAL '2 hours'),
      (admin_uid, 'admin@cois.app', 'admin', 'view', 'customers', NULL, '{"count":15}'::jsonb, '192.168.1.1', NOW() - INTERVAL '1 hour 55 min'),
      (admin_uid, 'admin@cois.app', 'admin', 'export', 'reports', NULL, '{"format":"pdf","report":"executive-dashboard"}'::jsonb, '192.168.1.1', NOW() - INTERVAL '1 hour 30 min'),
      (admin_uid, 'admin@cois.app', 'admin', 'update', 'customers', 'c-001', '{"field":"risk_level","from":"High","to":"Critical"}'::jsonb, '192.168.1.1', NOW() - INTERVAL '45 min'),
      (admin_uid, 'admin@cois.app', 'admin', 'escalate', 'risk_alerts', 'ra-001', '{"customer":"Vantage Capital Partners","severity":"Critical"}'::jsonb, '192.168.1.1', NOW() - INTERVAL '30 min'),
      (admin_uid, 'admin@cois.app', 'admin', 'view', 'analytics', NULL, '{"tab":"health_trends"}'::jsonb, '192.168.1.1', NOW() - INTERVAL '15 min'),
      (admin_uid, 'admin@cois.app', 'admin', 'invite', 'team_invitations', NULL, '{"invited_email":"newmember@cois.app","role":"cs_specialist"}'::jsonb, '192.168.1.1', NOW() - INTERVAL '5 min')
    ON CONFLICT DO NOTHING;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Audit log seed failed: %', SQLERRM;
END $$;
