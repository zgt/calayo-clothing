# Database Migration Plan: Profiles → User Table Consolidation

## Overview
Migrate from Supabase Auth profiles system to Better Auth user-centric system by:
1. Removing the `profiles` table 
2. Adding missing columns to `user` table
3. Updating all foreign key relationships from profile_id to user_id
4. Updating application code

## Pre-Migration Requirements
- [ ] Full database backup
- [ ] Application downtime window (estimated 15-30 minutes)
- [ ] Test environment validation
- [ ] Rollback plan ready

## Migration Phases

### Phase 1: Pre-Migration Validation and Backup
**Script**: `01_pre_migration.sql`
- Data integrity checks
- Orphaned record detection
- User data mapping validation
- Critical data backup to temporary tables

### Phase 2: Schema Modifications
**Script**: `02_schema_migration.sql`  
- Add missing columns to `user` table (bio, website, location, phone)
- Create temporary staging columns for data migration
- Disable foreign key constraints temporarily
- Drop RLS policies that will conflict

### Phase 3: Data Migration and FK Updates
**Script**: `03_data_migration.sql`
- Migrate profile data to user table using better_auth_user_id mapping
- Update foreign keys in dependent tables:
  - `profile_measurements.profile_id` → references `user.id`
  - `commissions.user_id` → references `user.id` 
  - `messages.sender_id` → references `user.id`
- Validate all data transfers completed successfully

### Phase 4: Cleanup and Finalization
**Script**: `04_cleanup.sql`
- Drop `profiles` table
- Remove obsolete triggers and functions
- Recreate appropriate RLS policies for `user` table
- Update indexes and constraints
- Final validation queries

## Key Technical Considerations

### Data Type Compatibility
- **Challenge**: `profiles.id` (uuid) vs `user.id` (text)
- **Solution**: Use `better_auth_user_id` mapping field for cross-reference

### Foreign Key Strategy
- Update all FK references to point to `user.id` using the mapping table
- Ensure data integrity throughout the migration process

### Row Level Security (RLS) Updates
Current policies on `profiles`:
```sql
- "Users can update their own profile" 
- "Users can view their own profile"
```
Must be recreated for `user` table with Better Auth context.

### Application Code Impact
- All tRPC procedures referencing `profiles`
- Frontend components using profile data
- Authentication middleware and context

## Rollback Strategy
1. Restore from backup if migration fails before cleanup phase
2. After cleanup phase: Use temporary backup tables to restore if needed
3. Application code rollback: Git revert to pre-migration state

## Risk Mitigation
- **High Risk**: Data loss during FK updates → Extensive validation at each step
- **Medium Risk**: Application downtime → Thorough testing in staging
- **Low Risk**: Performance impact → Migration runs during low-traffic window

## Success Criteria
- [ ] All profile data successfully migrated to user table
- [ ] All foreign key relationships updated and validated
- [ ] Application functions correctly with new schema
- [ ] No data loss or corruption detected
- [ ] Performance maintained or improved

## Timeline Estimate
- **Preparation**: 2-3 hours
- **Migration execution**: 15-30 minutes
- **Validation and testing**: 1-2 hours
- **Total**: 4-6 hours