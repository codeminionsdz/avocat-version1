-- Create payment_receipts table for offline payment tracking

CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_receipts
CREATE POLICY "Lawyers can view their own receipts"
  ON public.payment_receipts FOR SELECT
  USING (auth.uid() = lawyer_id);

CREATE POLICY "Lawyers can insert their own receipts"
  ON public.payment_receipts FOR INSERT
  WITH CHECK (auth.uid() = lawyer_id);
