-- =====================================================
-- Schema Migration Script: Add columns to user table (Corrected)
-- =====================================================
-- Purpose: Modify user table structure to accommodate profile data
-- Run after 01_pre_migration.sql validation passes

BEGIN;

-- =====================================================
-- PRE-FLIGHT CHECKS
-- =====================================================

-- Verify pre-migration was run successfully
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'migration_backup_profiles') THEN
        RAISE EXCEPTION 'Pre-migration backup not found. Run 01_pre_migration.sql first.';
    END IF;
    
    -- Check if all profiles have valid Better Auth mappings
    IF EXISTS (
        SELECT 1 FROM migration_profile_user_mapping 
        WHERE mapping_status != 'OK'
    ) THEN
        RAISE WARNING 'Not all profiles have valid Better Auth mappings. Proceeding may cause data loss.';
        RAISE NOTICE 'Run this query to see issues: SELECT * FROM migration_profile_user_mapping WHERE mapping_status != ''OK'';';
    END IF;
END $$;

-- =====================================================
-- DISABLE CONSTRAINTS AND POLICIES
-- =====================================================

-- Temporarily disable Row Level Security for easier data manipulation
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;
ALTER TABLE commissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_measurements DISABLE ROW LEVEL SECURITY;

-- Drop foreign key constraints that will be recreated later
ALTER TABLE profile_measurements DROP CONSTRAINT IF EXISTS profile_measurements_profile_id_fkey;
ALTER TABLE commissions DROP CONSTRAINT IF EXISTS commissions_user_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

DO $$
BEGIN
    RAISE NOTICE 'Disabled RLS policies and foreign key constraints for migration';
END $$;

-- =====================================================
-- ADD NEW COLUMNS TO USER TABLE
-- =====================================================

-- Add profile-specific columns to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS location VARCHAR(255);  
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Add temporary migration tracking columns
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS migration_profile_id UUID;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS migration_completed_at TIMESTAMP;

DO $$
BEGIN
    RAISE NOTICE 'Added new columns to user table: bio, website, location, phone';
END $$;

-- =====================================================
-- CREATE TEMPORARY STAGING COLUMNS
-- =====================================================

-- Add staging columns to dependent tables for smooth FK transition
ALTER TABLE profile_measurements ADD COLUMN IF NOT EXISTS temp_user_id TEXT;
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS temp_user_id TEXT; 
ALTER TABLE messages ADD COLUMN IF NOT EXISTS temp_sender_user_id TEXT;

DO $$
BEGIN
    RAISE NOTICE 'Added temporary staging columns for foreign key migration';
END $$;

-- =====================================================
-- VALIDATE SCHEMA CHANGES
-- =====================================================

-- Verify all new columns were added successfully
DO $$
DECLARE
    user_columns TEXT[];
    missing_columns TEXT[];
BEGIN
    -- Check user table has all required new columns
    SELECT ARRAY_AGG(column_name) INTO user_columns 
    FROM information_schema.columns 
    WHERE table_name = 'user' AND table_schema = 'public'
        AND column_name IN ('bio', 'website', 'location', 'phone', 'migration_profile_id');
    
    -- Check for missing columns
    SELECT ARRAY(
        SELECT unnest(ARRAY['bio', 'website', 'location', 'phone', 'migration_profile_id'])
        EXCEPT 
        SELECT unnest(user_columns)
    ) INTO missing_columns;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Missing columns in user table: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'All required columns successfully added to user table';
    END IF;
END $$;

-- =====================================================
-- SCHEMA MIGRATION SUMMARY
-- =====================================================

-- Display current schema state
DO $$
DECLARE
    user_count INTEGER;
    profile_count INTEGER;
    measurement_count INTEGER;
    commission_count INTEGER; 
    message_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM "user";
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO measurement_count FROM profile_measurements;
    SELECT COUNT(*) INTO commission_count FROM commissions;
    SELECT COUNT(*) INTO message_count FROM messages;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'SCHEMA MIGRATION COMPLETE';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Current record counts:';
    RAISE NOTICE '- Users: %', user_count;
    RAISE NOTICE '- Profiles: %', profile_count;
    RAISE NOTICE '- Profile Measurements: %', measurement_count;
    RAISE NOTICE '- Commissions: %', commission_count;
    RAISE NOTICE '- Messages: %', message_count;
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Ready for data migration (03_data_migration.sql)';
    RAISE NOTICE '==========================================';
END $$;

COMMIT;

-- Separate script: Run after main migration completes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_migration_profile_id 
    ON "user" (migration_profile_id) 
    WHERE migration_profile_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_measurements_temp_user_id 
    ON profile_measurements (temp_user_id) 
    WHERE temp_user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_temp_user_id 
    ON commissions (temp_user_id) 
    WHERE temp_user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_temp_sender_user_id 
    ON messages (temp_sender_user_id) 
    WHERE temp_sender_user_id IS NOT NULL;
