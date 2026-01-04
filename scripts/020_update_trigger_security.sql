-- ============================================
-- SECURITY: Update trigger to hardcode client role
-- ============================================
-- Run this after initial deployment to update the trigger
-- This ensures all new signups are created as 'client'
-- regardless of raw_user_meta_data content

-- Re-create the function with security fix
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- SECURITY: Always create as 'client', ignore raw_user_meta_data role
  -- Lawyer accounts must be created via backend admin API only
  INSERT INTO public.profiles (id, role, full_name, phone, city)
  VALUES (
    NEW.id,
    'client',  -- HARDCODED: Always client on signup
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'city', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  -- REMOVED: Auto lawyer_profiles creation
  -- Lawyers must be promoted via backend admin API only
  -- This prevents privilege escalation via raw_user_meta_data manipulation

  RETURN NEW;
END;
$$;

-- Trigger remains the same (already exists)
-- This just updates the function definition

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 
'Auto-creates client profile on user signup. SECURITY: Always creates role=client, ignoring raw_user_meta_data to prevent privilege escalation.';
