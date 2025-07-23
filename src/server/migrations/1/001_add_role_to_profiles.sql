-- Migration: Add role column to profiles table
-- This replaces the environment-based ADMIN_ID system with a database role system

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';

-- Create an index on the role column for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING btree (role);

-- Add a check constraint to ensure valid roles
ALTER TABLE public.profiles 
ADD CONSTRAINT check_profiles_role 
CHECK (role IN ('user', 'admin', 'moderator'));

-- Set the existing admin user to admin role (if ADMIN_ID is known)
-- This will need to be updated with the actual ADMIN_ID value during deployment
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'ADMIN_ID_PLACEHOLDER';

-- Add a comment to the role column
COMMENT ON COLUMN public.profiles.role IS 'User role: user (default), admin, or moderator';