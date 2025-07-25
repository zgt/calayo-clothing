-- Migration Runner Script
-- Execute these migrations in order to migrate from Supabase Auth to Better-Auth

-- This script should be run against your Supabase database
-- Make sure to backup your database before running these migrations!

-- Migration 001: Add role column to profiles
\echo 'Running Migration 001: Add role column to profiles...'
\i 001_add_role_to_profiles.sql

-- Migration 002: Create better-auth tables
\echo 'Running Migration 002: Create better-auth tables...'
\i 002_create_better_auth_tables.sql

-- Migration 003: Migrate Supabase users to better-auth
\echo 'Running Migration 003: Migrate users from Supabase to better-auth...'
\i 003_migrate_supabase_users_to_better_auth.sql

-- Migration 004: Update foreign key relationships
\echo 'Running Migration 004: Update foreign key relationships...'
\i 004_update_foreign_key_relationships.sql

-- Note: Migration 005 (set admin user) should be run separately with the actual ADMIN_ID
\echo 'Migration 005 (set admin user) should be run manually with the correct ADMIN_ID value'

\echo 'All migrations completed successfully!'
\echo 'Next steps:'
\echo '1. Update your environment variables with BETTER_AUTH_SECRET and BETTER_AUTH_URL'
\echo '2. Run migration 005 with your actual ADMIN_ID'
\echo '3. Deploy your application with better-auth integration'
\echo '4. Test the authentication flows'