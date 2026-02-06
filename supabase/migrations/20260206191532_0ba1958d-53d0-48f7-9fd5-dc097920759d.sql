
-- Analytics events table for internal tracking (page views, CTA clicks, conversions)
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'page_view', 'cta_click', 'signup', 'activation', 'conversion'
  page_path TEXT,
  event_name TEXT, -- e.g. 'hero_cta_connect', 'hero_cta_platforms'
  event_data JSONB DEFAULT '{}',
  referrer TEXT,
  user_agent TEXT,
  session_id TEXT, -- anonymous session fingerprint
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX idx_analytics_events_type_date ON public.analytics_events (event_type, created_at DESC);
CREATE INDEX idx_analytics_events_page ON public.analytics_events (page_path, created_at DESC);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Public visitors can insert events (no auth required for tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Only owner can read analytics data
CREATE POLICY "Owner can read analytics"
  ON public.analytics_events
  FOR SELECT
  USING (public.is_owner());

-- Block updates and deletes from non-owners
CREATE POLICY "Owner can delete analytics"
  ON public.analytics_events
  FOR DELETE
  USING (public.is_owner());
