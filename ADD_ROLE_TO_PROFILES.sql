-- ============================================
-- Add role column to profiles table
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('buyer', 'seller', 'delivery'));

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name = 'role';

-- Expected output should show: role | text | YES
