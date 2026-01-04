-- Update profiles with empty or null full_name
-- Set full_name to email username or phone number

-- First, show profiles with empty full_name
SELECT 
  p.id,
  p.full_name,
  p.phone,
  au.email as auth_email
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE p.full_name IS NULL OR p.full_name = '' OR p.full_name = 'User';

-- Update profiles to use email or phone as full_name if it's empty
UPDATE profiles p
SET 
  full_name = COALESCE(
    NULLIF(p.full_name, ''),
    NULLIF(p.full_name, 'User'),
    split_part(au.email, '@', 1),
    p.phone,
    'عميل'
  ),
  updated_at = NOW()
FROM auth.users au
WHERE 
  p.id = au.id 
  AND (p.full_name IS NULL OR p.full_name = '' OR p.full_name = 'User');

-- Verify the update
SELECT 
  p.id,
  p.full_name,
  p.phone,
  p.role,
  au.email
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.id
ORDER BY p.created_at DESC
LIMIT 20;
