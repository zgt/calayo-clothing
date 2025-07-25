-- Migration: Migrate users from Supabase auth.users to better-auth user table
-- This migration preserves existing user data and relationships

-- Temporary staging table to help with the migration
CREATE TEMP TABLE temp_user_mapping (
    old_id UUID,
    new_id TEXT,
    email TEXT
);

-- Step 1: Migrate users from auth.users to better-auth user table
-- Generate new text IDs for better-auth (using UUID as text)
INSERT INTO public.user (
    id,
    email,
    emailVerified,
    name,
    createdAt,
    updatedAt,
    email_confirmed_at,
    role
)
SELECT 
    -- Use the existing UUID as text for the new ID to maintain relationships
    auth_users.id::TEXT as id,
    profiles.email,
    CASE 
        WHEN auth_users.email_confirmed_at IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END as emailVerified,
    profiles.full_name as name,
    auth_users.created_at as createdAt,
    COALESCE(profiles.updated_at, auth_users.updated_at) as updatedAt,
    auth_users.email_confirmed_at,
    COALESCE(profiles.role, 'user') as role
FROM auth.users auth_users
INNER JOIN public.profiles profiles ON auth_users.id = profiles.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.user WHERE id = auth_users.id::TEXT
);

-- Store the mapping for reference
INSERT INTO temp_user_mapping (old_id, new_id, email)
SELECT 
    auth_users.id as old_id,
    auth_users.id::TEXT as new_id,
    profiles.email
FROM auth.users auth_users
INNER JOIN public.profiles profiles ON auth_users.id = profiles.id;

-- Step 2: Create password accounts for users who have encrypted passwords
-- Note: Supabase uses different password encryption, so users will need to reset passwords
INSERT INTO public.account (
    id,
    accountId,
    providerId,
    userId,
    password,
    createdAt,
    updatedAt
)
SELECT 
    gen_random_uuid()::TEXT as id,
    auth_users.id::TEXT as accountId,
    'credential' as providerId,
    auth_users.id::TEXT as userId,
    NULL as password, -- Will need to be set separately or prompt password reset
    auth_users.created_at as createdAt,
    auth_users.updated_at as updatedAt
FROM auth.users auth_users
INNER JOIN public.profiles profiles ON auth_users.id = profiles.id
WHERE auth_users.encrypted_password IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.account 
    WHERE userId = auth_users.id::TEXT AND providerId = 'credential'
);

-- Output migration summary
SELECT 
    'Migration Summary:' as info,
    COUNT(*) as users_migrated
FROM temp_user_mapping;

-- Show any users that couldn't be migrated
SELECT 
    'Users without profiles (not migrated):' as warning,
    auth_users.id,
    auth_users.email
FROM auth.users auth_users
LEFT JOIN public.profiles profiles ON auth_users.id = profiles.id
WHERE profiles.id IS NULL;

-- Verification: Check that all profile users have corresponding better-auth users
SELECT 
    'Verification - Profiles without better-auth users:' as check_result,
    COUNT(*) as count
FROM public.profiles profiles
LEFT JOIN public.user better_users ON profiles.id::TEXT = better_users.id
WHERE better_users.id IS NULL;