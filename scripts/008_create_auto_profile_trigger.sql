-- Trigger to automatically create profile when a new user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile for the user
  -- Default role is 'client', can be changed later
  INSERT INTO public.profiles (id, role, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    'client',
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also create profiles for existing users who don't have one
INSERT INTO public.profiles (id, role, full_name, created_at, updated_at)
SELECT 
  au.id,
  'client',
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'User'),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;
