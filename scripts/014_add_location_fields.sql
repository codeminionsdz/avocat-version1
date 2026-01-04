-- Add location fields to lawyer_profiles table

-- Add latitude and longitude for office location
ALTER TABLE public.lawyer_profiles 
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS location_visibility BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS office_address TEXT;

-- Add indexes for location queries
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_location 
  ON public.lawyer_profiles (latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.lawyer_profiles.latitude IS 'Office location latitude for map display';
COMMENT ON COLUMN public.lawyer_profiles.longitude IS 'Office location longitude for map display';
COMMENT ON COLUMN public.lawyer_profiles.location_visibility IS 'Whether to show office location to clients';
COMMENT ON COLUMN public.lawyer_profiles.office_address IS 'Office address text for display';
