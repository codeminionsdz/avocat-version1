-- Trigger to update consultation's updated_at when a new message is added
-- This ensures consultations with recent messages appear at the top of the chat list

CREATE OR REPLACE FUNCTION public.update_consultation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the consultation's updated_at timestamp
  UPDATE public.consultations
  SET updated_at = NOW()
  WHERE id = NEW.consultation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_consultation_on_new_message ON public.messages;

-- Create trigger
CREATE TRIGGER update_consultation_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_consultation_on_message();
