-- Create trigger to auto-create profile on user signup

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lawyer_profiles_updated_at ON public.lawyer_profiles;
CREATE TRIGGER update_lawyer_profiles_updated_at
  BEFORE UPDATE ON public.lawyer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultations_updated_at ON public.consultations;
CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
