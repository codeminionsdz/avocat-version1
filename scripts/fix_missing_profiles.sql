-- Script to check and fix missing profiles

-- 1. Check all users in auth.users
SELECT 
  'Users in auth.users' as check_name,
  COUNT(*) as count
FROM auth.users;

-- 2. Check all profiles
SELECT 
  'Profiles in public.profiles' as check_name,
  COUNT(*) as count
FROM public.profiles;

-- 3. Find users without profiles
SELECT 
  'Users without profiles' as check_name,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 4. Show users without profiles (with details)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 5. Check consultations and their client_ids
SELECT 
  c.id as consultation_id,
  c.client_id,
  c.lawyer_id,
  c.status,
  p.id as profile_exists,
  p.full_name,
  p.phone
FROM consultations c
LEFT JOIN profiles p ON p.id = c.client_id
ORDER BY c.created_at DESC;

-- 6. Create profiles for all users who don't have one
INSERT INTO public.profiles (id, role, full_name, phone, city, created_at, updated_at)
SELECT 
  au.id,
  CASE 
    WHEN EXISTS (SELECT 1 FROM lawyer_profiles lp WHERE lp.id = au.id) THEN 'lawyer'
    ELSE 'client'
  END as role,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name', 
    split_part(au.email, '@', 1),
    'User'
  ) as full_name,
  COALESCE(
    au.raw_user_meta_data->>'phone_number',
    au.raw_user_meta_data->>'phone',
    au.phone
  ) as phone,
  au.raw_user_meta_data->>'city' as city,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 7. Verify all consultations now have valid client profiles
SELECT 
  'Consultations with missing client profiles' as check_name,
  COUNT(*) as count
FROM consultations c
LEFT JOIN profiles p ON p.id = c.client_id
WHERE p.id IS NULL;
