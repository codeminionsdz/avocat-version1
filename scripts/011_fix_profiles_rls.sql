-- Fix RLS policies for profiles to allow lawyers to see client profiles

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Lawyers can view client profiles for their consultations
CREATE POLICY "Lawyers can view client profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.lawyer_id = auth.uid()
      AND consultations.client_id = profiles.id
    )
  );

-- Policy: Clients can view lawyer profiles for their consultations
CREATE POLICY "Clients can view lawyer profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.client_id = auth.uid()
      AND consultations.lawyer_id = profiles.id
    )
  );

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';
