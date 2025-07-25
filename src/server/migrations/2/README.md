# Database Migration: Profiles → User Table Consolidation

## Overview
This migration removes the `profiles` table and consolidates all user data into the Better Auth `user` table, updating all foreign key relationships accordingly.

## ✅ Migration Deliverables

### Phase 1: Analysis and Planning
- [x] **Database Schema Analysis** - Analyzed `backup-2.sql` structure
- [x] **Migration Plan** - Comprehensive plan in `MIGRATION_PLAN.md`

### Phase 2: Database Migration Scripts
- [x] **01_pre_migration.sql** - Data validation and backup creation
- [x] **02_schema_migration.sql** - Schema modifications and column additions
- [x] **03_data_migration.sql** - Data transfer and foreign key updates
- [x] **04_cleanup.sql** - Profiles table removal and finalization

### Phase 3: Application Code Updates  
- [x] **Code Analysis** - Identified all profile table references
- [x] **Application Updates** - Updated key files to use user table
- [x] **Code Migration Guide** - Detailed guide in `APPLICATION_CODE_MIGRATION.md`

## 🚀 Migration Execution Order

Execute in this exact order:

1. **Backup Database** (outside this repo)
   ```bash
   pg_dump -h your-host -U your-user -d your-db > backup.sql
   ```

2. **Run Pre-Migration Validation**
   ```sql
   \i 01_pre_migration.sql
   ```
   ⚠️ Review output carefully - fix any issues before continuing

3. **Apply Schema Changes**
   ```sql
   \i 02_schema_migration.sql
   ```

4. **Migrate Data**
   ```sql
   \i 03_data_migration.sql
   ```
   ⚠️ Review validation output before proceeding

5. **Cleanup and Finalize**
   ```sql
   \i 04_cleanup.sql
   ```

6. **Update Application Code** - Deploy code changes

7. **Test Application** - Verify all functionality works

## 📋 Key Changes Made

### Database Changes
- ✅ Added `bio`, `website`, `location`, `phone` columns to `user` table
- ✅ Updated `profile_measurements.profile_id` → `profile_measurements.user_id`
- ✅ Updated `commissions.user_id` to reference `user` table (uuid→text)
- ✅ Updated `messages.sender_id` to reference `user` table (uuid→text)
- ✅ Removed `profiles` table completely
- ✅ Updated all foreign key constraints
- ✅ Updated RLS policies (basic templates - customize for Better Auth)

### Application Code Changes
- ✅ **tRPC Router** (`src/server/api/routers/commissions.ts`)
  - Fixed admin queries to use `user` table instead of `profiles`
  - Updated field mappings: `first_name, last_name` → `name`

- ✅ **Profile Measurements Service** (`src/server/api/commissions/fetch-profile-measurements.ts`)
  - Updated to query `profile_measurements` table directly
  - Changed from `profile_id` to `user_id` foreign key

- ✅ **Profile Form** (`src/app/profile/_components/ProfileForm.tsx`)
  - Updated to work with `user` table instead of `profiles`
  - Changed field mapping: `full_name` → `name`

- ✅ **Measurements Form** (`src/app/profile/measurements/_components/MeasurementsForm.tsx`)
  - Updated foreign key references from `profile_id` to `user_id`

## ⚠️ Important Notes

### RLS Policies
The migration creates basic RLS policy templates. You MUST customize these for your Better Auth implementation:

```sql
-- Example: Update for Better Auth context
CREATE POLICY "Users can update their own profile" ON "user"
    FOR UPDATE USING (auth.jwt() ->> 'sub' = id);
```

### Remaining Files to Update
These files still contain profile references and will need manual updates:
- `src/app/admin/orders/[id]/_components/AdminCommissionDetails.tsx`
- `src/app/admin/orders/page.tsx` 
- `src/app/admin/orders/_components/AdminCommissionsTable.tsx`
- `src/app/admin/orders/[id]/page.tsx`
- `src/app/_components/Messages.tsx`
- `src/app/profile/page.tsx`
- `src/app/profile/measurements/page.tsx`
- `src/app/commissions/utils.ts`
- `src/types/supabase.ts` (type definitions)

### Data Type Changes
- User IDs changed from `uuid` to `text` to match Better Auth
- All foreign keys updated to use `text` type
- Profile data merged into `user` table with appropriate field mappings

### Testing Checklist
After migration, verify:
- [ ] User authentication works with Better Auth
- [ ] Profile creation/updates work
- [ ] Measurements can be saved and retrieved
- [ ] Commission creation associates with correct user
- [ ] Admin features show user data correctly
- [ ] Messages system works with new user references
- [ ] All TypeScript compilation passes
- [ ] No database constraint violations

### Rollback Plan
- Database: Restore from backup created in step 1
- Application: `git revert` to pre-migration state
- Backup tables available until cleanup confirmed working

## 🔄 Additional Considerations

### Performance
- Added indexes on new foreign key columns
- Migration includes `VACUUM ANALYZE` for optimization
- Consider monitoring query performance post-migration

### Security  
- Review and update RLS policies for Better Auth
- Validate user access patterns work correctly
- Test admin functionality with new user structure

### Monitoring
- Monitor error logs during migration
- Check application logs for any profile table references
- Validate data integrity with post-migration queries

## 📞 Support
If issues arise during migration:
1. Check error logs and validation output from each script
2. Verify backup tables exist before cleanup phase
3. Test rollback procedure in staging environment first
4. Review `APPLICATION_CODE_MIGRATION.md` for detailed code update guidance