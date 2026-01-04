-- ============================================
-- SECURITY: Fix consultation RLS to verify client role
-- ============================================
-- Ensure only users with role='client' can insert consultations
-- This prevents lawyers from creating consultation requests

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Clients can insert consultations" ON public.consultations;

-- Create enhanced policy that verifies both auth and role
CREATE POLICY "Clients can insert consultations"
ON public.consultations
FOR INSERT
WITH CHECK (
  auth.uid() = client_id 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'client'
  )
);

-- Add comment for documentation
COMMENT ON POLICY "Clients can insert consultations" ON public.consultations IS 
'Allows consultation creation only by authenticated users with role=client. Prevents lawyers from creating consultation requests.';

-- Also update the client update policy for consistency
DROP POLICY IF EXISTS "Clients can update their own consultations" ON public.consultations;

CREATE POLICY "Clients can update their own consultations"
ON public.consultations
FOR UPDATE
USING (
  auth.uid() = client_id
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'client'
  )
);

COMMENT ON POLICY "Clients can update their own consultations" ON public.consultations IS 
'Allows consultation updates only by the client who created it. Verifies role=client.';
