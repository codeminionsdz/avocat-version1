-- Create messages table for in-app chat

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
-- Users can view messages for consultations they are part of
CREATE POLICY "Users can view messages for their consultations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = consultation_id
      AND (c.client_id = auth.uid() OR c.lawyer_id = auth.uid())
    )
  );

-- Users can insert messages for consultations they are part of
CREATE POLICY "Users can insert messages for their consultations"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = consultation_id
      AND (c.client_id = auth.uid() OR c.lawyer_id = auth.uid())
    )
  );

-- Users can update messages they sent (mark as read)
CREATE POLICY "Recipients can mark messages as read"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = consultation_id
      AND (c.client_id = auth.uid() OR c.lawyer_id = auth.uid())
    )
  );
