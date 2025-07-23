-- =====================================================
-- Pre-Migration Script: Validation and Backup (Corrected)
-- =====================================================
-- Purpose: Validate data integrity and create backups before migration
-- Run this script first to ensure safe migration

-- Start transaction for rollback capability
BEGIN;

-- =====================================================
-- DATA INTEGRITY CHECKS
-- =====================================================

-- Check 1: Validate profiles have corresponding Better Auth users
DO $$
DECLARE
    orphaned_profiles INTEGER;
    total_profiles INTEGER;
    profile_record RECORD;
BEGIN
    SELECT COUNT(*) INTO total_profiles FROM profiles;
    
    SELECT COUNT(*) INTO orphaned_profiles 
    FROM profiles p 
    WHERE p.better_auth_user_id IS NULL 
       OR NOT EXISTS (
           SELECT 1 FROM "user" u 
           WHERE u.id = p.better_auth_user_id
       );
    
    RAISE NOTICE 'Total profiles: %, Orphaned profiles: %', total_profiles, orphaned_profiles;
    
    IF orphaned_profiles > 0 THEN
        RAISE WARNING 'Found % orphaned profiles without Better Auth users!', orphaned_profiles;
        
        -- Show details of orphaned profiles
        RAISE NOTICE 'Orphaned profiles details:';
        FOR profile_record IN 
            SELECT id, email, full_name, better_auth_user_id 
            FROM profiles p 
            WHERE p.better_auth_user_id IS NULL 
               OR NOT EXISTS (SELECT 1 FROM "user" u WHERE u.id = p.better_auth_user_id)
            LIMIT 10
        LOOP
            RAISE NOTICE 'Profile ID: %, Email: %, Name: %, Better Auth ID: %', 
                profile_record.id, profile_record.email, profile_record.full_name, profile_record.better_auth_user_id;
        END LOOP;
    END IF;
END $$;

-- Check 2: Validate foreign key relationships
DO $$
DECLARE
    orphaned_measurements INTEGER;
    orphaned_commissions INTEGER;
    orphaned_messages INTEGER;
BEGIN
    -- Check profile_measurements orphans
    SELECT COUNT(*) INTO orphaned_measurements 
    FROM profile_measurements pm 
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = pm.profile_id);
    
    -- Check commissions orphans  
    SELECT COUNT(*) INTO orphaned_commissions 
    FROM commissions c 
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = c.user_id);
    
    -- Check messages orphans
    SELECT COUNT(*) INTO orphaned_messages 
    FROM messages m 
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = m.sender_id);
    
    RAISE NOTICE 'Orphaned measurements: %, commissions: %, messages: %', 
        orphaned_measurements, orphaned_commissions, orphaned_messages;
        
    IF orphaned_measurements + orphaned_commissions + orphaned_messages > 0 THEN
        RAISE WARNING 'Found orphaned records! Manual cleanup required before migration.';
    END IF;
END $$;

-- Check 3: Validate data types and constraints
DO $$
DECLARE
    invalid_emails INTEGER;
    long_names INTEGER;
BEGIN
    -- Check for invalid email formats in profiles
    SELECT COUNT(*) INTO invalid_emails 
    FROM profiles 
    WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
    
    -- Check for overly long names that might not fit in user.name
    SELECT COUNT(*) INTO long_names 
    FROM profiles 
    WHERE LENGTH(full_name) > 255;
    
    RAISE NOTICE 'Invalid emails: %, Long names: %', invalid_emails, long_names;
    
    IF invalid_emails > 0 OR long_names > 0 THEN
        RAISE WARNING 'Data validation issues found that may need manual correction.';
    END IF;
END $$;

-- =====================================================
-- BACKUP CREATION
-- =====================================================

-- Create backup table for profiles data
DROP TABLE IF EXISTS migration_backup_profiles;
CREATE TABLE migration_backup_profiles AS 
SELECT * FROM profiles;

SELECT 'Created backup table: migration_backup_profiles with ' || COUNT(*) || ' rows' AS message 
FROM migration_backup_profiles;

-- Create backup table for foreign key mappings
DROP TABLE IF EXISTS migration_backup_mappings;
CREATE TABLE migration_backup_mappings AS
SELECT 
    p.id as profile_id,
    p.better_auth_user_id as user_id,
    p.email,
    p.full_name,
    -- Count related records
    (SELECT COUNT(*) FROM profile_measurements pm WHERE pm.profile_id = p.id) as measurement_count,
    (SELECT COUNT(*) FROM commissions c WHERE c.user_id = p.id) as commission_count,
    (SELECT COUNT(*) FROM messages m WHERE m.sender_id = p.id) as message_count
FROM profiles p;

SELECT 'Created mapping table: migration_backup_mappings with ' || COUNT(*) || ' rows' AS message 
FROM migration_backup_mappings;

-- Create backup of foreign key tables before modification
DROP TABLE IF EXISTS migration_backup_profile_measurements;
CREATE TABLE migration_backup_profile_measurements AS 
SELECT * FROM profile_measurements;

DROP TABLE IF EXISTS migration_backup_commissions;  
CREATE TABLE migration_backup_commissions AS 
SELECT * FROM commissions;

DROP TABLE IF EXISTS migration_backup_messages;
CREATE TABLE migration_backup_messages AS 
SELECT * FROM messages;

SELECT 'Created backup tables for all dependent tables' AS message;

-- =====================================================
-- PRE-MIGRATION DATA PREPARATION
-- =====================================================

-- Create mapping validation view
CREATE OR REPLACE VIEW migration_profile_user_mapping AS
SELECT 
    p.id as profile_id,
    p.better_auth_user_id as user_id,
    p.email as profile_email,
    u.email as user_email,
    p.full_name as profile_name,
    u.name as user_name,
    p.bio,
    p.website,
    p.location,
    p.phone,
    CASE 
        WHEN p.better_auth_user_id IS NULL THEN 'NO_BETTER_AUTH_ID'
        WHEN NOT EXISTS (SELECT 1 FROM "user" u2 WHERE u2.id = p.better_auth_user_id) THEN 'BETTER_AUTH_USER_MISSING'
        WHEN p.email != u.email THEN 'EMAIL_MISMATCH'
        ELSE 'OK'
    END as mapping_status
FROM profiles p
LEFT JOIN "user" u ON u.id = p.better_auth_user_id;

-- Show mapping validation summary
DO $$
DECLARE
    rec RECORD;
    total INTEGER;
BEGIN
    SELECT COUNT(*) INTO total FROM migration_profile_user_mapping;
    
    RAISE NOTICE 'Profile to User Mapping Summary (Total: %)', total;
    RAISE NOTICE '=====================================';
    
    FOR rec IN 
        SELECT mapping_status, COUNT(*) as count 
        FROM migration_profile_user_mapping 
        GROUP BY mapping_status 
        ORDER BY count DESC
    LOOP
        RAISE NOTICE 'Status: % - Count: %', rec.mapping_status, rec.count;
    END LOOP;
END $$;

-- =====================================================
-- VALIDATION SUMMARY
-- =====================================================

DO $$
DECLARE
    total_profiles INTEGER;
    ready_profiles INTEGER;
    backup_size TEXT;
BEGIN
    SELECT COUNT(*) INTO total_profiles FROM profiles;
    
    SELECT COUNT(*) INTO ready_profiles 
    FROM migration_profile_user_mapping 
    WHERE mapping_status = 'OK';
    
    SELECT pg_size_pretty(pg_total_relation_size('migration_backup_profiles')) INTO backup_size;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'PRE-MIGRATION VALIDATION COMPLETE';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total profiles: %', total_profiles;
    RAISE NOTICE 'Ready for migration: %', ready_profiles;
    RAISE NOTICE 'Backup table size: %', backup_size;
    RAISE NOTICE 'Migration readiness: %', 
        CASE 
            WHEN ready_profiles = total_profiles THEN '✅ READY'
            ELSE '⚠️ MANUAL INTERVENTION REQUIRED' 
        END;
    RAISE NOTICE '==========================================';
    
    IF ready_profiles != total_profiles THEN
        RAISE WARNING 'Not all profiles are ready for migration. Check mapping_status in migration_profile_user_mapping view.';
        RAISE WARNING 'Run: SELECT * FROM migration_profile_user_mapping WHERE mapping_status != ''OK'';';
    END IF;
END $$;

-- Commit the backup and validation work
COMMIT;