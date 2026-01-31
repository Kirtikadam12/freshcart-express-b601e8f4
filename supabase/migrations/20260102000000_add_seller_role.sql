-- Add 'seller' to the app_role enum if it doesn't already exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'seller' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
    ) THEN
        ALTER TYPE public.app_role ADD VALUE 'seller';
    END IF;
END $$;

-- Note: The existing RLS policies already cover sellers:
-- - "Users can view their own role" allows sellers to view their role
-- - "Users can insert their own role" allows sellers to insert their role
