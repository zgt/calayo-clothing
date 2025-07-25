-- Migration: Set admin user role based on ADMIN_ID environment variable
-- This should be run after the initial migration with the actual ADMIN_ID value

-- Instructions:
-- 1. Replace 'ADMIN_ID_PLACEHOLDER' with the actual ADMIN_ID from your environment
-- 2. Run this script to set the admin user role

-- Example of how to find the admin user ID from environment:
-- In your application, you can get process.env.ADMIN_ID and use it here

-- Update profiles table
UPDATE public.profiles 
SET role = 'admin' 
WHERE id::TEXT = 'f87ff66e-16c9-43cb-b2ba-05e46488da62'
AND role != 'admin';

-- Update better-auth user table  
UPDATE public.user 
SET role = 'admin' 
WHERE id = 'f87ff66e-16c9-43cb-b2ba-05e46488da62'
AND role != 'admin';

-- Verify the update
SELECT 
    'Admin user verification:' as info,
    p.id,
    p.email,
    p.role as profile_role,
    u.role as user_role,
    p.full_name
FROM public.profiles p
INNER JOIN public.user u ON p.better_auth_user_id = u.id
WHERE p.role = 'admin' OR u.role = 'admin';

-- Count users by role
SELECT 
    'Role distribution:' as info,
    role,
    COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY role;

-- If no admin user found, show warning
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
        RAISE NOTICE 'WARNING: No admin user found. Please update ADMIN_ID_PLACEHOLDER with the correct user ID.';
    END IF;
END $$;