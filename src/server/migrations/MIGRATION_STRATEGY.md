# Supabase Auth to Better-Auth Migration Strategy

## Overview

This migration strategy preserves all existing data while transitioning from Supabase Auth to Better-Auth. The approach maintains backward compatibility during the transition period.

## Current Database Structure

### Existing Tables and Relationships
- `auth.users` (Supabase managed) → `profiles` (application managed)
- `profiles` → `commissions` (one-to-many)
- `profiles` → `messages` (one-to-many via sender_id)
- `profiles` → `profile_measurements` (one-to-one)
- `commissions` → `commission_measurements` (one-to-one)

### Current Admin System
- Uses environment variable `ADMIN_ID` to identify admin users
- No role-based system in database

## Migration Plan

### Phase 1: Prepare Database (Migrations 001-002)
1. **Add role column to profiles** (`001_add_role_to_profiles.sql`)
   - Adds `role` column with default 'user'
   - Creates check constraint for valid roles
   - Maintains environment-based admin identification temporarily

2. **Create better-auth tables** (`002_create_better_auth_tables.sql`)
   - Creates standard better-auth schema
   - Adds role field to user table for consistency
   - Includes all necessary indexes and constraints

### Phase 2: Data Migration (Migration 003)
3. **Migrate users from Supabase to Better-Auth** (`003_migrate_supabase_users_to_better_auth.sql`)
   - Transfers user data from `auth.users` to better-auth `user` table
   - Preserves existing UUIDs as text IDs to maintain relationships
   - Creates credential accounts for password-based users
   - Includes verification queries to ensure data integrity

### Phase 3: Update Relationships (Migration 004)
4. **Update foreign key relationships** (`004_update_foreign_key_relationships.sql`)
   - Adds dual reference system to profiles table
   - Maintains existing relationships with commissions and messages
   - Provides path for future complete migration

## Key Design Decisions

### ID Preservation Strategy
- **Problem**: Supabase uses UUIDs, Better-Auth uses TEXT
- **Solution**: Convert existing UUIDs to TEXT format
- **Benefit**: Maintains all existing foreign key relationships

### Dual Reference System
- **Current**: `profiles.id` references `auth.users.id`
- **New**: `profiles.better_auth_user_id` references `user.id`
- **Transition**: Both references exist during migration period
- **Future**: Can gradually migrate to single reference

### Role System Migration
- **Before**: Environment variable `ADMIN_ID`
- **After**: Database role column with 'user', 'admin', 'moderator'
- **Migration**: Manual update of admin user role required

## Data Integrity Considerations

### Foreign Key Preservation
- All existing relationships remain intact
- `commissions.user_id` continues to reference `profiles.id`
- `messages.sender_id` continues to reference `profiles.id`
- `profile_measurements.profile_id` continues to reference `profiles.id`

### Password Handling
- **Issue**: Supabase and Better-Auth use different password encryption
- **Solution**: Users will need to reset passwords after migration
- **Alternative**: Implement custom password verification during transition

### Session Management
- Existing Supabase sessions will be invalidated
- Users will need to re-authenticate with Better-Auth
- Consider implementing session migration for smoother UX

## Migration Execution Order

1. Run migrations in numerical order (001 → 004)
2. Update environment variables to include Better-Auth config
3. Deploy application with Better-Auth integration
4. Manually set admin user role using the ADMIN_ID
5. Test authentication flows
6. Gradually transition users to new authentication system

## Rollback Strategy

### Emergency Rollback
- Better-Auth tables can be dropped without affecting existing data
- Profiles table changes are additive (role column can remain)
- Original Supabase auth relationships remain intact

### Staged Rollback
- Remove better-auth references while keeping data
- Continue using original Supabase auth system
- Role system can remain as enhancement

## Post-Migration Tasks

### Required Environment Variables Update
```env
# Add to .env.local
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

### Admin User Role Assignment
```sql
-- Update with actual ADMIN_ID from environment
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'actual-admin-user-id';

UPDATE public.user 
SET role = 'admin' 
WHERE id = 'actual-admin-user-id';
```

### Application Code Updates
- Update authentication logic to use Better-Auth
- Modify user context to use new user structure
- Update API routes to work with Better-Auth sessions
- Implement password reset flow for existing users

## Testing Strategy

### Pre-Migration Tests
- Verify all current functionality works
- Export current user data for comparison
- Test admin functionality with current system

### Post-Migration Tests
- Verify data integrity (all users migrated correctly)
- Test authentication flows (login, logout, registration)
- Verify admin functionality with new role system
- Test all existing features (commissions, messages, measurements)

### Data Validation Queries
```sql
-- Verify user migration
SELECT COUNT(*) FROM auth.users;
SELECT COUNT(*) FROM public.user;

-- Verify profile integrity
SELECT COUNT(*) FROM profiles WHERE better_auth_user_id IS NULL;

-- Verify role assignment
SELECT role, COUNT(*) FROM profiles GROUP BY role;
```

## Future Optimizations

### Single Reference System
After successful migration and testing:
- Update all foreign keys to reference better-auth user IDs directly
- Remove Supabase auth dependency completely
- Simplify profiles table structure

### Enhanced Role System
- Add more granular permissions
- Implement role-based access control in application
- Consider hierarchical role system if needed

## Risk Assessment

### High Risk
- Data loss during migration
- Authentication system failure
- Session invalidation causing user lockout

### Medium Risk
- Password reset requirements for all users
- Performance impact during migration
- Foreign key constraint violations

### Low Risk
- Role system conflicts
- Better-Auth configuration issues
- Environment variable management

## Success Criteria

1. All existing users successfully migrated to Better-Auth
2. No data loss in profiles, commissions, or measurements
3. Admin functionality works with new role system
4. All authentication flows function correctly
5. Existing features remain fully operational
6. Performance maintains current levels or improves