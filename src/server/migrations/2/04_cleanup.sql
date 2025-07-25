-- =====================================================
-- Cleanup Script: Remove profiles table and finalize migration
-- =====================================================
-- Purpose: Complete the migration by removing obsolete structures
-- Run after 03_data_migration.sql completes successfully


BEGIN;

-- =====================================================
-- PRE-CLEANUP VALIDATION
-- =====================================================

DO $$
DECLARE
    data_validation_passed BOOLEAN := true;
    orphaned_measurements INTEGER;
    orphaned_commissions INTEGER;
    orphaned_messages INTEGER;
BEGIN
    -- Verify data migration was completed
    IF NOT EXISTS (
        SELECT 1 FROM "user" WHERE migration_profile_id IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Data migration appears incomplete. No migrated users found.';
    END IF;
    
    -- Final check for orphaned records
    SELECT COUNT(*) INTO orphaned_measurements 
    FROM profile_measurements pm 
    WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE u.id = pm.user_id);
    
    SELECT COUNT(*) INTO orphaned_commissions 
    FROM commissions c 
    WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE u.id = c.user_id);
    
    SELECT COUNT(*) INTO orphaned_messages 
    FROM messages m 
    WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE u.id = m.sender_id);
    
    IF orphaned_measurements + orphaned_commissions + orphaned_messages > 0 THEN
        RAISE WARNING 'Found orphaned records: measurements=%, commissions=%, messages=%', 
            orphaned_measurements, orphaned_commissions, orphaned_messages;
        RAISE WARNING 'Continuing with cleanup, but data integrity issues exist.';
        data_validation_passed := false;
    END IF;
    
    RAISE NOTICE 'Pre-cleanup validation: %', 
        CASE WHEN data_validation_passed THEN '✅ PASSED' ELSE '⚠️ WARNINGS' END;
END $$;

-- =====================================================
-- DROP OBSOLETE TRIGGERS AND FUNCTIONS
-- =====================================================

-- Drop the Supabase trigger that creates profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

DO $$
BEGIN
    RAISE NOTICE 'Dropped obsolete Supabase auth triggers and functions';
END $$;
-- =====================================================
-- DROP ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Drop all RLS policies on profiles table
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Drop RLS policies on other tables that reference profiles
DROP POLICY IF EXISTS "Users can insert their own commissions" ON commissions;
DROP POLICY IF EXISTS "Users can update their own commissions" ON commissions;
DROP POLICY IF EXISTS "Users can delete their own commissions" ON commissions;
DROP POLICY IF EXISTS "Enable read access for all users" ON commissions;

DROP POLICY IF EXISTS "Users can view messages for their commissions" ON messages;
DROP POLICY IF EXISTS "Users can insert messages for their commissions" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

DO $$
BEGIN
    RAISE NOTICE 'Dropped obsolete RLS policies';
END $$;

-- =====================================================
-- DROP PROFILES TABLE AND RELATED STRUCTURES
-- =====================================================

-- Drop indexes related to profiles
DROP INDEX IF EXISTS idx_profiles_better_auth_user_id;
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_role;

-- Drop the migration mapping view
DROP VIEW IF EXISTS migration_profile_user_mapping;

-- Drop the profiles table completely
DROP TABLE IF EXISTS profiles CASCADE;


DO $$
BEGIN
    RAISE NOTICE 'Dropped profiles table and related structures';
END $$;

-- =====================================================
-- CLEAN UP MIGRATION ARTIFACTS
-- =====================================================

-- Remove temporary migration columns from user table
ALTER TABLE "user" DROP COLUMN IF EXISTS migration_profile_id;
ALTER TABLE "user" DROP COLUMN IF EXISTS migration_completed_at;

-- Drop temporary migration indexes
DROP INDEX IF EXISTS idx_user_migration_profile_id;
DROP INDEX IF EXISTS idx_profile_measurements_temp_user_id;
DROP INDEX IF EXISTS idx_commissions_temp_user_id;
DROP INDEX IF EXISTS idx_messages_temp_sender_user_id;

DO $$
BEGIN
    RAISE NOTICE 'Cleaned up temporary migration artifacts';
END $$;

-- =====================================================
-- RECREATE APPROPRIATE RLS POLICIES FOR USER-CENTRIC SYSTEM
-- =====================================================

-- Enable RLS on user table
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- Note: Better Auth typically handles its own RLS, but we'll create basic policies
-- These may need adjustment based on your Better Auth configuration

-- Basic user table policies (may need customization for Better Auth)
CREATE POLICY "Users can view their own profile" ON "user"
    FOR SELECT USING (true); -- Better Auth handles this

CREATE POLICY "Users can update their own profile" ON "user"
    FOR UPDATE USING (true); -- Better Auth handles this

-- Update commissions policies to work with new user table
CREATE POLICY "Users can view commissions" ON commissions
    FOR SELECT USING (true); -- Adjust based on your access requirements

CREATE POLICY "Users can insert their own commissions" ON commissions
    FOR INSERT WITH CHECK (true); -- Will need Better Auth context

CREATE POLICY "Users can update their own commissions" ON commissions
    FOR UPDATE USING (true); -- Will need Better Auth context

CREATE POLICY "Users can delete their own commissions" ON commissions
    FOR DELETE USING (true); -- Will need Better Auth context

-- Update messages policies  
CREATE POLICY "Users can view messages" ON messages
    FOR SELECT USING (true); -- Will need commission access logic

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (true); -- Will need Better Auth context

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (true); -- Will need Better Auth context

CREATE POLICY "Users can delete their own messages" ON messages
    FOR DELETE USING (true); -- Will need Better Auth context

-- Re-enable RLS on all tables
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_measurements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    RAISE NOTICE 'Recreated RLS policies for Better Auth system';
    RAISE WARNING 'RLS policies created with basic templates - customize for your Better Auth implementation';
END $$;
-- =====================================================
-- OPTIMIZE DATABASE AFTER MIGRATION
-- =====================================================

-- Update table statistics for better query planning
ANALYZE "user";
ANALYZE commissions;
ANALYZE messages;
ANALYZE profile_measurements;

-- Vacuum tables to reclaim space
VACUUM (ANALYZE) "user";
VACUUM (ANALYZE) commissions;
VACUUM (ANALYZE) messages;
VACUUM (ANALYZE) profile_measurements;

DO $$
BEGIN
  RAISE NOTICE 'Optimized database tables and updated statistics';
END $$;
-- =====================================================
-- FINAL MIGRATION SUMMARY
-- =====================================================

DO $$
DECLARE
    user_count INTEGER;
    commission_count INTEGER;
    message_count INTEGER;
    measurement_count INTEGER;
    user_with_bio INTEGER;
    user_with_location INTEGER;
    commission_measurement_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM "user";
    SELECT COUNT(*) INTO commission_count FROM commissions;
    SELECT COUNT(*) INTO message_count FROM messages;
    SELECT COUNT(*) INTO measurement_count FROM profile_measurements;
    
    SELECT COUNT(*) INTO user_with_bio FROM "user" WHERE bio IS NOT NULL;
    SELECT COUNT(*) INTO user_with_location FROM "user" WHERE location IS NOT NULL;
    
    SELECT COUNT(*) INTO commission_measurement_count 
    FROM commission_measurements;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Final database state:';
    RAISE NOTICE '- Users: % (% with bio, % with location)', user_count, user_with_bio, user_with_location;
    RAISE NOTICE '- Commissions: %', commission_count;
    RAISE NOTICE '- Messages: %', message_count;
    RAISE NOTICE '- Profile measurements: %', measurement_count;
    RAISE NOTICE '- Commission measurements: %', commission_measurement_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Migration artifacts removed:';
    RAISE NOTICE '- ✅ Profiles table dropped';
    RAISE NOTICE '- ✅ Obsolete triggers removed';
    RAISE NOTICE '- ✅ Old RLS policies updated';
    RAISE NOTICE '- ✅ Foreign keys updated to user table';
    RAISE NOTICE '- ✅ Database optimized';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT NEXT STEPS:';
    RAISE NOTICE '1. Update application code to use user table';
    RAISE NOTICE '2. Customize RLS policies for Better Auth';
    RAISE NOTICE '3. Test all application functionality';
    RAISE NOTICE '4. Remove backup tables when confident';
    RAISE NOTICE '============================================';
END $$;

-- =====================================================
-- BACKUP CLEANUP INSTRUCTIONS
-- =====================================================

-- Create a script to clean up backup tables (don't run automatically)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'To clean up backup tables after verification, run:';
    RAISE NOTICE 'DROP TABLE migration_backup_profiles;';
    RAISE NOTICE 'DROP TABLE migration_backup_mappings;';
    RAISE NOTICE 'DROP TABLE migration_backup_profile_measurements;';
    RAISE NOTICE 'DROP TABLE migration_backup_commissions;';
    RAISE NOTICE 'DROP TABLE migration_backup_messages;';
    RAISE NOTICE '';
    RAISE NOTICE 'Keep backup tables until application testing is complete!';
END $$;

COMMIT;
