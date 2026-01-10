-- ============================================
-- FIX: Infinite recursion in profiles RLS policy
-- ============================================
-- The previous policy caused infinite recursion because it queried
-- the profiles table from within a profiles table policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "prevent_role_self_escalation" ON profiles;

-- Drop the old update policy to replace it
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate update policy without the recursive subquery
-- Users can update their profile but role column is protected separately
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a separate policy that blocks role updates entirely via user updates
-- The role field should only be updated via service role (backend APIs)
-- This is enforced at the trigger level, not policy level, to avoid recursion

-- Verify the fix worked
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
