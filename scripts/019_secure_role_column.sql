-- ============================================
-- SECURITY: Prevent unauthorized role changes
-- ============================================
-- This script prevents users from escalating their own role
-- Only specific backend APIs should be able to update role to 'lawyer'

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "prevent_role_self_escalation" ON profiles;

-- Create policy to prevent users from updating their own role
CREATE POLICY "prevent_role_self_escalation"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  -- User can update their profile BUT NOT change their role
  role = (SELECT role FROM profiles WHERE id = auth.uid())
);

-- Add comment for documentation
COMMENT ON POLICY "prevent_role_self_escalation" ON profiles IS 
'Prevents users from changing their own role. Role changes must be done via service role (backend APIs only).';
