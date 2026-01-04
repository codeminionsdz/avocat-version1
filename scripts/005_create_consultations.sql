-- Create consultations table for consultation requests

CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('criminal', 'family', 'civil', 'commercial', 'administrative', 'labor', 'immigration')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consultations
CREATE POLICY "Clients can view their own consultations"
  ON public.consultations FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Lawyers can view consultations assigned to them"
  ON public.consultations FOR SELECT
  USING (auth.uid() = lawyer_id);

CREATE POLICY "Clients can insert consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Lawyers can update consultations assigned to them"
  ON public.consultations FOR UPDATE
  USING (auth.uid() = lawyer_id);

CREATE POLICY "Clients can update their own consultations"
  ON public.consultations FOR UPDATE
  USING (auth.uid() = client_id);
