-- ============================================================
-- COIS Auth Roles Migration
-- Adds user_profiles with role-based access control
-- ============================================================

-- 1. Types
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM (
  'admin',
  'ceo',
  'operations_director',
  'cs_manager',
  'cs_specialist',
  'support_agent'
);

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'support_agent'::public.user_role,
  avatar_url TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- 4. Trigger function: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'support_agent')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 5. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 6. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "users_can_read_all_profiles" ON public.user_profiles;
CREATE POLICY "users_can_read_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- 8. Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- 9. Update existing tables RLS to allow authenticated users
-- Allow all authenticated users to read operational data
DROP POLICY IF EXISTS "authenticated_read_customers" ON public.customers;
CREATE POLICY "authenticated_read_customers"
ON public.customers
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_write_customers" ON public.customers;
CREATE POLICY "authenticated_write_customers"
ON public.customers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read_tasks" ON public.tasks;
CREATE POLICY "authenticated_read_tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_write_tasks" ON public.tasks;
CREATE POLICY "authenticated_write_tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read_milestone_stages" ON public.milestone_stages;
CREATE POLICY "authenticated_read_milestone_stages"
ON public.milestone_stages
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_write_milestone_stages" ON public.milestone_stages;
CREATE POLICY "authenticated_write_milestone_stages"
ON public.milestone_stages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read_risk_alerts" ON public.risk_alerts;
CREATE POLICY "authenticated_read_risk_alerts"
ON public.risk_alerts
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_write_risk_alerts" ON public.risk_alerts;
CREATE POLICY "authenticated_write_risk_alerts"
ON public.risk_alerts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 10. Mock users for demo
DO $$
DECLARE
  admin_uuid UUID := gen_random_uuid();
  ceo_uuid UUID := gen_random_uuid();
  ops_uuid UUID := gen_random_uuid();
  csm_uuid UUID := gen_random_uuid();
  css_uuid UUID := gen_random_uuid();
  agent_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@cois.app', crypt('Admin@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'System Admin', 'role', 'admin'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (ceo_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'ceo@cois.app', crypt('Ceo@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Lavish Pandey', 'role', 'ceo'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (ops_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'ops@cois.app', crypt('Ops@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Daniel Osei', 'role', 'operations_director'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (csm_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'csmanager@cois.app', crypt('Csm@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Aiko Tanaka', 'role', 'cs_manager'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (css_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'specialist@cois.app', crypt('Css@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Marcus Webb', 'role', 'cs_specialist'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (agent_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'agent@cois.app', crypt('Agent@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Lena Muller', 'role', 'support_agent'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock user creation skipped: %', SQLERRM;
END $$;
