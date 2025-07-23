-- =====================================================
-- Data Migration Script: Transfer profile data to user table
-- =====================================================
-- Purpose: Migrate data from profiles table to user table and update FKs
-- Run after 02_schema_migration.sql completes successfully

BEGIN;

-- =====================================================
-- PRE-FLIGHT VALIDATION
-- =====================================================

DO $$
BEGIN
    -- Verify schema migration was completed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user' AND column_name = 'migration_profile_id'
    ) THEN
        RAISE EXCEPTION 'Schema migration not complete. Run 02_schema_migration.sql first.';
    END IF;
    
    -- Verify backup tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'migration_backup_profiles') THEN
        RAISE EXCEPTION 'Backup tables not found. Run 01_pre_migration.sql first.';
    END IF;
    
    RAISE NOTICE 'Pre-flight checks passed. Beginning data migration.';
END $$;

-- =====================================================
-- MIGRATE PROFILE DATA TO USER TABLE
-- =====================================================

-- Step 1: Update existing user records with profile data
UPDATE "user" 
SET 
    bio = p.bio,
    website = p.website,
    location = p.location,
    phone = p.phone,
    name = COALESCE("user".name, p.full_name), -- Prefer existing name, fallback to profile
    image = COALESCE("user".image, p.avatar_url), -- Prefer existing image, fallback to profile
    migration_profile_id = p.id,
    migration_completed_at = NOW(),
    "updatedAt" = NOW()
FROM profiles p
WHERE "user".id = p.better_auth_user_id 
    AND p.better_auth_user_id IS NOT NULL;

-- Get migration statistics
DO $$
DECLARE
    migrated_users INTEGER;
    total_profiles INTEGER;
    unmigrated_profiles INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_users 
    FROM "user" 
    WHERE migration_profile_id IS NOT NULL;
    
    SELECT COUNT(*) INTO total_profiles 
    FROM profiles;
    
    SELECT COUNT(*) INTO unmigrated_profiles
    FROM profiles p 
    WHERE p.better_auth_user_id IS NULL 
       OR NOT EXISTS (SELECT 1 FROM "user" u WHERE u.id = p.better_auth_user_id);
    
    RAISE NOTICE 'Profile data migration summary:';
    RAISE NOTICE '- Total profiles: %', total_profiles;
    RAISE NOTICE '- Successfully migrated to users: %', migrated_users;
    RAISE NOTICE '- Unmigrated profiles: %', unmigrated_profiles;
    
    IF unmigrated_profiles > 0 THEN
        RAISE WARNING '% profiles could not be migrated due to missing Better Auth users', unmigrated_profiles;
    END IF;
END $$;

-- =====================================================
-- UPDATE FOREIGN KEY REFERENCES - PROFILE_MEASUREMENTS
-- =====================================================

-- Update profile_measurements to reference user table instead of profiles
UPDATE profile_measurements 
SET temp_user_id = u.id
FROM profiles p
JOIN "user" u ON u.migration_profile_id = p.id
WHERE profile_measurements.profile_id = p.id;

-- Validate profile_measurements migration
DO $$
DECLARE
    total_measurements INTEGER;
    migrated_measurements INTEGER;
    failed_measurements INTEGER;
    measurement_record RECORD;
BEGIN
    SELECT COUNT(*) INTO total_measurements FROM profile_measurements;
    
    SELECT COUNT(*) INTO migrated_measurements 
    FROM profile_measurements 
    WHERE temp_user_id IS NOT NULL;
    
    SELECT COUNT(*) INTO failed_measurements 
    FROM profile_measurements 
    WHERE temp_user_id IS NULL;
    
    RAISE NOTICE 'Profile measurements FK migration:';
    RAISE NOTICE '- Total measurements: %', total_measurements;
    RAISE NOTICE '- Successfully migrated: %', migrated_measurements;
    RAISE NOTICE '- Failed migrations: %', failed_measurements;
    
    IF failed_measurements > 0 THEN
        RAISE WARNING '% profile measurements could not be migrated', failed_measurements;
        -- Show details of failed migrations
        FOR measurement_record IN
            SELECT pm.id, pm.profile_id, p.email, p.better_auth_user_id
            FROM profile_measurements pm
            JOIN profiles p ON p.id = pm.profile_id
            WHERE pm.temp_user_id IS NULL
            LIMIT 5
        LOOP
            RAISE NOTICE 'Failed measurement ID: %, Profile: % (%), Better Auth ID: %', 
                measurement_record.id, measurement_record.profile_id, 
                measurement_record.email, measurement_record.better_auth_user_id;
        END LOOP;
    END IF;
END $$;

-- =====================================================
-- UPDATE FOREIGN KEY REFERENCES - COMMISSIONS
-- =====================================================

-- Update commissions to reference user table instead of profiles
UPDATE commissions 
SET temp_user_id = u.id
FROM profiles p
JOIN "user" u ON u.migration_profile_id = p.id
WHERE commissions.user_id = p.id;

-- Validate commissions migration
DO $$
DECLARE
    total_commissions INTEGER;
    migrated_commissions INTEGER;
    failed_commissions INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_commissions FROM commissions;
    
    SELECT COUNT(*) INTO migrated_commissions 
    FROM commissions 
    WHERE temp_user_id IS NOT NULL;
    
    SELECT COUNT(*) INTO failed_commissions 
    FROM commissions 
    WHERE temp_user_id IS NULL;
    
    RAISE NOTICE 'Commissions FK migration:';
    RAISE NOTICE '- Total commissions: %', total_commissions;
    RAISE NOTICE '- Successfully migrated: %', migrated_commissions;
    RAISE NOTICE '- Failed migrations: %', failed_commissions;
    
    IF failed_commissions > 0 THEN
        RAISE WARNING '% commissions could not be migrated', failed_commissions;
    END IF;
END $$;

-- =====================================================
-- UPDATE FOREIGN KEY REFERENCES - MESSAGES
-- =====================================================

-- Update messages to reference user table instead of profiles  
UPDATE messages 
SET temp_sender_user_id = u.id
FROM profiles p
JOIN "user" u ON u.migration_profile_id = p.id
WHERE messages.sender_id = p.id;

-- Validate messages migration
DO $$
DECLARE
    total_messages INTEGER;
    migrated_messages INTEGER;
    failed_messages INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_messages FROM messages;
    
    SELECT COUNT(*) INTO migrated_messages 
    FROM messages 
    WHERE temp_sender_user_id IS NOT NULL;
    
    SELECT COUNT(*) INTO failed_messages 
    FROM messages 
    WHERE temp_sender_user_id IS NULL;
    
    RAISE NOTICE 'Messages FK migration:';
    RAISE NOTICE '- Total messages: %', total_messages;
    RAISE NOTICE '- Successfully migrated: %', migrated_messages;
    RAISE NOTICE '- Failed migrations: %', failed_messages;
    
    IF failed_messages > 0 THEN
        RAISE WARNING '% messages could not be migrated', failed_messages;
    END IF;
END $$;

-- =====================================================
-- FINALIZE FOREIGN KEY COLUMN UPDATES
-- =====================================================

-- Replace old FK columns with new ones in profile_measurements
ALTER TABLE profile_measurements DROP COLUMN profile_id;
ALTER TABLE profile_measurements RENAME COLUMN temp_user_id TO user_id;
ALTER TABLE profile_measurements ALTER COLUMN user_id SET NOT NULL;

SELECT conname AS constraint_name, contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'commissions'::regclass
  AND array_position(conkey, (
    SELECT attnum FROM pg_attribute WHERE attrelid = 'commissions'::regclass AND attname = 'user_id'
  )) IS NOT NULL;

-- Replace constraint names below with those found in the previous query
ALTER TABLE commissions DROP CONSTRAINT IF EXISTS commissions_user_id_fkey;
-- Add additional DROP CONSTRAINT statements here for any other constraints found, e.g.:
-- ALTER TABLE commissions DROP CONSTRAINT IF EXISTS <other_constraint_name>;


-- Drop the old foreign key constraint if it exists
ALTER TABLE public.commissions DROP CONSTRAINT IF EXISTS commissions_user_id_fkey;

-- Drop any index on commissions.user_id (replace with actual index name if different)
DROP INDEX IF EXISTS idx_commissions_user_id;

-- Drop the old user_id column
ALTER TABLE public.commissions DROP COLUMN IF EXISTS user_id;

-- Rename temp_user_id to user_id and set NOT NULL
ALTER TABLE public.commissions RENAME COLUMN temp_user_id TO user_id;
ALTER TABLE public.commissions ALTER COLUMN user_id SET NOT NULL;

-- Change type to text to match user.id
ALTER TABLE public.commissions ALTER COLUMN user_id TYPE text;


-- Recreate the index
CREATE INDEX idx_commissions_user_id ON public.commissions (user_id);

-- Replace old FK columns with new ones in messages
ALTER TABLE messages RENAME COLUMN temp_sender_user_id TO new_sender_id;
ALTER TABLE messages DROP COLUMN sender_id;
ALTER TABLE messages RENAME COLUMN new_sender_id TO sender_id;
ALTER TABLE messages ALTER COLUMN sender_id SET NOT NULL;

DO $$
BEGIN
  RAISE NOTICE 'Finalized foreign key column updates';
END $$;

-- =====================================================
-- CREATE NEW FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add new foreign key constraints pointing to user table
ALTER TABLE profile_measurements 
    ADD CONSTRAINT profile_measurements_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- Note: commissions.user_id now needs to be TEXT to match user.id
ALTER TABLE commissions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE commissions 
    ADD CONSTRAINT commissions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- Note: messages.sender_id now needs to be TEXT to match user.id  
ALTER TABLE messages ALTER COLUMN sender_id TYPE TEXT;
ALTER TABLE messages 
    ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES "user"(id) ON DELETE CASCADE;

DO $$
BEGIN
  RAISE NOTICE 'Created new foreign key constraints pointing to user table';
END $$;

-- =====================================================
-- UPDATE INDEXES
-- =====================================================

-- Update indexes to reflect new column names and types
DROP INDEX IF EXISTS idx_commissions_user_id;
CREATE INDEX idx_commissions_user_id ON commissions (user_id);

DROP INDEX IF EXISTS idx_messages_sender_id;  
CREATE INDEX idx_messages_sender_id ON messages (sender_id);

-- Add index for profile_measurements.user_id
CREATE INDEX idx_profile_measurements_user_id ON profile_measurements (user_id);

DO $$
BEGIN
  RAISE NOTICE 'Updated indexes for new foreign key structure';
END $$;

-- =====================================================
-- FINAL VALIDATION
-- =====================================================

-- Comprehensive validation of data integrity
DO $$
DECLARE
    total_users INTEGER;
    migrated_users INTEGER;
    orphaned_measurements INTEGER;
    orphaned_commissions INTEGER;
    orphaned_messages INTEGER;
    data_integrity_ok BOOLEAN := true;
BEGIN
    SELECT COUNT(*) INTO total_users FROM "user";
    SELECT COUNT(*) INTO migrated_users FROM "user" WHERE migration_profile_id IS NOT NULL;
    
    -- Check for orphaned records after migration
    SELECT COUNT(*) INTO orphaned_measurements 
    FROM profile_measurements pm 
    WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE u.id = pm.user_id);
    
    SELECT COUNT(*) INTO orphaned_commissions 
    FROM commissions c 
    WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE u.id = c.user_id);
    
    SELECT COUNT(*) INTO orphaned_messages 
    FROM messages m 
    WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE u.id = m.sender_id);
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DATA MIGRATION VALIDATION RESULTS';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Users: % total, % migrated from profiles', total_users, migrated_users;
    RAISE NOTICE 'Orphaned records after migration:';
    RAISE NOTICE '- Profile measurements: %', orphaned_measurements;
    RAISE NOTICE '- Commissions: %', orphaned_commissions;
    RAISE NOTICE '- Messages: %', orphaned_messages;
    
    IF orphaned_measurements + orphaned_commissions + orphaned_messages > 0 THEN
        data_integrity_ok := false;
        RAISE WARNING 'Data integrity issues detected! Review orphaned records before cleanup.';
    END IF;
    
    RAISE NOTICE 'Data integrity status: %', 
        CASE WHEN data_integrity_ok THEN '✅ PASSED' ELSE '❌ ISSUES FOUND' END;
    RAISE NOTICE '==========================================';
    
    IF NOT data_integrity_ok THEN
        RAISE WARNING 'Resolve data integrity issues before proceeding to cleanup phase.';
    END IF;
END $$;

-- Commit all data migration changes
COMMIT;
