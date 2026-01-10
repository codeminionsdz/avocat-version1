-- ============================================
-- SECURITY: Prevent unauthorized role changes
-- ============================================
-- This script prevents users from escalating their own role
-- Only specific backend APIs should be able to update role to 'lawyer'

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "prevent_role_self_escalation" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate simple update policy without recursive subquery
-- Users can update their own profile (role protection handled by trigger)
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Note: Role changes are prevented by the trigger created in 020_update_trigger_security.sql
-- Using a policy WITH CHECK that queries the same table causes infinite recursion
-- The trigger approach is more reliable for this use case
