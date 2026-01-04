-- Add court level authorization to lawyer profiles
-- Supports Algerian judicial hierarchy: First Instance, Appeal, Supreme Court, Council of State

-- Add authorized_courts column to lawyer_profiles
ALTER TABLE public.lawyer_profiles 
ADD COLUMN IF NOT EXISTS authorized_courts TEXT[] DEFAULT ARRAY['first_instance'];

-- Add comment explaining court levels
COMMENT ON COLUMN public.lawyer_profiles.authorized_courts IS 
'Court authorization levels for lawyers:
- first_instance: Regular courts (default for all lawyers)
- appeal: Appellate courts
- supreme_court: Supreme Court (Cour Suprême - Cassation)
- council_of_state: Council of State (Conseil d''État - Administrative)';

-- Update existing lawyer profiles to have first_instance by default
UPDATE public.lawyer_profiles 
SET authorized_courts = ARRAY['first_instance']
WHERE authorized_courts IS NULL OR authorized_courts = '{}';

-- Add check constraint to ensure valid court levels
ALTER TABLE public.lawyer_profiles
ADD CONSTRAINT check_authorized_courts 
CHECK (
  authorized_courts <@ ARRAY['first_instance', 'appeal', 'supreme_court', 'council_of_state']::TEXT[]
);

-- Create index for court level filtering
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_authorized_courts 
ON public.lawyer_profiles USING GIN (authorized_courts);

-- Add helper function to check if lawyer is authorized for a court level
CREATE OR REPLACE FUNCTION is_lawyer_authorized_for_court(
  lawyer_courts TEXT[],
  required_court TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Supreme court lawyers can handle all levels
  IF 'supreme_court' = ANY(lawyer_courts) THEN
    RETURN TRUE;
  END IF;
  
  -- Council of state lawyers can handle administrative cases at all levels
  IF 'council_of_state' = ANY(lawyer_courts) AND required_court = 'council_of_state' THEN
    RETURN TRUE;
  END IF;
  
  -- Appeal lawyers can handle first instance and appeal
  IF 'appeal' = ANY(lawyer_courts) AND required_court IN ('first_instance', 'appeal') THEN
    RETURN TRUE;
  END IF;
  
  -- First instance lawyers can only handle first instance
  IF 'first_instance' = ANY(lawyer_courts) AND required_court = 'first_instance' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
