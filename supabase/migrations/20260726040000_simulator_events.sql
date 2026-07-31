-- Migration: simulator_events table for Event Simulator persistence
-- Timestamp: 20260726040000

CREATE TABLE IF NOT EXISTS public.simulator_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  environment TEXT NOT NULL DEFAULT 'Production',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_simulator_events_created_at ON public.simulator_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulator_events_severity ON public.simulator_events(severity);

ALTER TABLE public.simulator_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "simulator_events_read" ON public.simulator_events;
CREATE POLICY "simulator_events_read"
ON public.simulator_events
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "simulator_events_insert" ON public.simulator_events;
CREATE POLICY "simulator_events_insert"
ON public.simulator_events
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "simulator_events_delete" ON public.simulator_events;
CREATE POLICY "simulator_events_delete"
ON public.simulator_events
FOR DELETE
TO authenticated
USING (true);
