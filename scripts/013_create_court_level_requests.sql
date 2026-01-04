-- Create court level requests table
-- Tracks lawyer requests for higher court authorizations (Appeal, Supreme Court, Council of State)
-- Requires admin approval workflow

CREATE TABLE IF NOT EXISTS public.court_level_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_level TEXT NOT NULL CHECK (requested_level IN ('appeal', 'supreme_court', 'council_of_state')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  justification TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate pending requests for the same lawyer and level
  UNIQUE(lawyer_id, requested_level, status)
);

-- Enable RLS
ALTER TABLE public.court_level_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Lawyers can view their own requests"
  ON public.court_level_requests FOR SELECT
  USING (auth.uid() = lawyer_id);

CREATE POLICY "Lawyers can insert their own requests"
  ON public.court_level_requests FOR INSERT
  WITH CHECK (auth.uid() = lawyer_id);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_court_level_requests_lawyer_id 
  ON public.court_level_requests(lawyer_id);

CREATE INDEX IF NOT EXISTS idx_court_level_requests_status 
  ON public.court_level_requests(status);

-- Comment
COMMENT ON TABLE public.court_level_requests IS 
'Tracks lawyer requests for higher court authorizations. 
First Instance is default for all lawyers. 
Appeal, Supreme Court, and Council of State require admin approval.';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_court_level_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER court_level_requests_updated_at
  BEFORE UPDATE ON public.court_level_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_court_level_requests_updated_at();
