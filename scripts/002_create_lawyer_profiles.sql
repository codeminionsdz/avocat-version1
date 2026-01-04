-- Create lawyer_profiles table for lawyer-specific information

CREATE TABLE IF NOT EXISTS public.lawyer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  bar_number TEXT NOT NULL UNIQUE,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  years_of_experience INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  consultations_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lawyer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lawyer_profiles
CREATE POLICY "Lawyers can view their own profile"
  ON public.lawyer_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Lawyers can insert their own profile"
  ON public.lawyer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Lawyers can update their own profile"
  ON public.lawyer_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow anyone to view active lawyer profiles (for client browsing)
CREATE POLICY "Anyone can view active lawyer profiles"
  ON public.lawyer_profiles FOR SELECT
  USING (status = 'active');
