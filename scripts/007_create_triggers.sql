-- Create trigger to auto-create profile on user signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'client'),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'city', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  -- If user is a lawyer, create lawyer_profiles entry
  IF NEW.raw_user_meta_data ->> 'role' = 'lawyer' THEN
    INSERT INTO public.lawyer_profiles (
      id,
      bar_number,
      specialties,
      bio,
      years_of_experience
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'bar_number', ''),
      COALESCE(
        ARRAY(SELECT jsonb_array_elements_text((NEW.raw_user_meta_data ->> 'specialties')::jsonb)),
        '{}'
      ),
      COALESCE(NEW.raw_user_meta_data ->> 'bio', ''),
      COALESCE((NEW.raw_user_meta_data ->> 'years_of_experience')::INTEGER, 0)
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

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
