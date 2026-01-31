-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('buyer', 'seller', 'delivery'));

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Update RLS policies to allow role updates
-- The existing policies already cover this, but we ensure role can be updated
-- Users can already update their own profile (including role) based on existing policy
