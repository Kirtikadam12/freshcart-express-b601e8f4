-- profiles(id, role) role storage (no Supabase Auth metadata)
-- This migration:
-- - adds `role` column to `public.profiles`
-- - ensures RLS policies allow users to read/write their own row by `id = auth.uid()`

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('buyer', 'seller', 'delivery'));

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies keyed by profiles.id = auth.uid()
DO $$
BEGIN
  -- Drop older policies if they exist (safe in dev; ignore errors if not present)
  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles';
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles';
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles';
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

