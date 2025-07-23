-- Migration: Update foreign key relationships for better-auth compatibility
-- This updates the profiles table to work with better-auth user IDs

-- Step 1: Add new user_id column to profiles table that references better-auth users
ALTER TABLE public.profiles 
ADD COLUMN better_auth_user_id TEXT;

-- Step 2: Populate the new column with corresponding better-auth user IDs
UPDATE public.profiles 
SET better_auth_user_id = id::TEXT
WHERE EXISTS (
    SELECT 1 FROM public.user WHERE id = profiles.id::TEXT
);

-- Step 3: Add foreign key constraint to better-auth user table
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_better_auth_user_id_fkey 
FOREIGN KEY (better_auth_user_id) REFERENCES public.user(id) ON DELETE CASCADE;

-- Step 4: Create index on the new foreign key
CREATE INDEX IF NOT EXISTS idx_profiles_better_auth_user_id 
ON public.profiles USING btree (better_auth_user_id);

-- Step 5: Update commissions table to use profiles.id (which will continue to work)
-- No changes needed here as commissions.user_id -> profiles.id relationship remains valid

-- Step 6: Update messages table sender_id (continues to use profiles.id)
-- No changes needed here as messages.sender_id -> profiles.id relationship remains valid

-- Verification queries
SELECT 
    'Profiles with better-auth user references:' as info,
    COUNT(*) as count
FROM public.profiles 
WHERE better_auth_user_id IS NOT NULL;

SELECT 
    'Profiles without better-auth user references:' as warning,
    COUNT(*) as count
FROM public.profiles 
WHERE better_auth_user_id IS NULL;

-- Add comment explaining the dual reference system
COMMENT ON COLUMN public.profiles.better_auth_user_id IS 
'Reference to better-auth user table. Maintains dual compatibility during migration period.';

COMMENT ON COLUMN public.profiles.id IS 
'Original Supabase auth.users reference. Maintained for existing foreign key relationships with commissions and messages tables.';