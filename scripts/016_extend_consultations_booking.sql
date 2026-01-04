-- Extend Consultations for Simple Booking System
-- Add consultation type, duration, and timing fields

-- Add new columns to consultations table
ALTER TABLE public.consultations
ADD COLUMN IF NOT EXISTS consultation_type TEXT CHECK (consultation_type IN ('chat', 'call', 'in_person')),
ADD COLUMN IF NOT EXISTS requested_duration INTEGER CHECK (requested_duration IN (15, 30)),
ADD COLUMN IF NOT EXISTS requested_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS confirmed_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lawyer_notes TEXT;

-- Update existing consultations to have default values
UPDATE public.consultations
SET consultation_type = 'chat'
WHERE consultation_type IS NULL;

-- Make consultation_type required for new rows
ALTER TABLE public.consultations
ALTER COLUMN consultation_type SET NOT NULL;

-- Create index for consultation time queries
CREATE INDEX IF NOT EXISTS idx_consultations_requested_time ON public.consultations(requested_time);
CREATE INDEX IF NOT EXISTS idx_consultations_confirmed_time ON public.consultations(confirmed_time);
CREATE INDEX IF NOT EXISTS idx_consultations_type ON public.consultations(consultation_type);

-- Add new status to existing check constraint
-- First drop the old constraint
ALTER TABLE public.consultations DROP CONSTRAINT IF EXISTS consultations_status_check;

-- Add new constraint with additional status
ALTER TABLE public.consultations
ADD CONSTRAINT consultations_status_check 
CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled', 'rescheduled'));
