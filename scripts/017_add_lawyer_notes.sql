-- Migration: Add lawyer_notes field to consultations table
-- Purpose: Allow lawyers to add instructions/notes after accepting consultation requests
-- Examples: Call instructions, office directions, documents needed, etc.

-- Add lawyer_notes column
ALTER TABLE consultations
ADD COLUMN IF NOT EXISTS lawyer_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN consultations.lawyer_notes IS 'Instructions from lawyer to client (e.g., call details, office directions, documents needed)';

-- Create index for queries that filter by notes existence
CREATE INDEX IF NOT EXISTS idx_consultations_has_notes 
ON consultations ((lawyer_notes IS NOT NULL AND lawyer_notes != ''))
WHERE status = 'accepted';

-- Grant permissions
GRANT SELECT, UPDATE ON consultations TO authenticated;
