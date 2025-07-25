# Application Code Migration Plan

## Overview
After the database migration completes, the following application code needs to be updated to work with the new user-centric schema.

## Files Requiring Updates

### 1. tRPC Router - Commissions API
**File**: `src/server/api/routers/commissions.ts`

**Issues Found**:
- Line 247: `profiles (first_name, last_name, email)` - Should reference `user` table
- Line 307: Same issue in admin getById query

**Changes Required**:
- Replace `profiles` table references with `user` table
- Update field mappings: `full_name` → `name`, `first_name/last_name` → `name`

### 2. Profile Measurements Service
**File**: `src/server/api/commissions/fetch-profile-measurements.ts`

**Issues Found**:
- Lines 22-24: Queries `profiles` table for measurements
- Lines 42-44: Same issue in API version

**Changes Required**:
- Switch from `profiles` table to `profile_measurements` table
- Update query to use `user_id` instead of `profile_id`

### 3. Profile Management Components
**File**: `src/app/profile/_components/ProfileForm.tsx`

**Issues Found**:
- Lines 58-64: INSERT into `profiles` table
- Lines 69-72: UPDATE `profiles` table

**Changes Required**:
- Update to use `user` table instead of `profiles`
- Adjust field mappings: `full_name` → `name`
- Change `id` field handling to use text instead of uuid

### 4. Profile Measurements Component
**File**: `src/app/profile/measurements/_components/MeasurementsForm.tsx`

**Issues Found**:
- Line 8: `profile_id` field reference
- Uses `profile_measurements` table structure

**Changes Required**:
- Change `profile_id` to `user_id` 
- Update field type from `uuid` to `text`
- Ensure foreign key references `user` table

### 5. Additional Files with Profile References
The following files also contain profile table references and will need updates:

- `src/app/admin/orders/[id]/_components/AdminCommissionDetails.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/orders/_components/AdminCommissionsTable.tsx`
- `src/app/admin/orders/[id]/page.tsx`
- `src/app/_components/Messages.tsx`
- `src/app/profile/page.tsx`
- `src/app/profile/measurements/page.tsx`
- `src/app/commissions/utils.ts`

## Type Definitions Updates Required

### 1. Database Types
**File**: `src/types/supabase.ts`

**Changes Required**:
- Remove `profiles` table type definitions
- Update `user` table to include bio, website, location, phone
- Update foreign key type references from `uuid` to `text`

## Migration Steps

### Step 1: Update tRPC Routers
1. Update commissions router to query `user` instead of `profiles`
2. Change field mappings in SELECT queries
3. Update all admin queries to use correct table

### Step 2: Update Profile Management
1. Update ProfileForm to use `user` table
2. Change field names and ID types
3. Update form validation and error handling

### Step 3: Update Measurements System
1. Change profile_measurements queries to use user_id
2. Update foreign key references
3. Change ID types from uuid to text

### Step 4: Update Admin Components
1. Update admin queries to use `user` table
2. Update data display components
3. Fix user lookup and display logic

### Step 5: Update Type Definitions
1. Remove profiles-related types
2. Add user table type extensions
3. Update foreign key type mappings

## Testing Checklist

After making code changes, verify:
- [ ] User profile creation and updates work
- [ ] Profile measurements can be saved and loaded
- [ ] Commission creation with user association works
- [ ] Admin commission listing shows user info correctly
- [ ] Messages system works with new user references
- [ ] All type checking passes
- [ ] No broken references to profiles table

## Code Change Templates

### tRPC Query Update Example
```typescript
// Before
.select(`
  *,
  profiles (first_name, last_name, email)
`)

// After  
.select(`
  *,
  user (name, email)
`)
```

### Profile Form Update Example
```typescript
// Before
await supabase.from("profiles").insert([{
  id: user.id,
  email: user.email,
  full_name: formData.full_name
}]);

// After
await supabase.from("user").update({
  name: formData.full_name,
  bio: formData.bio,
  // ... other fields
}).eq("id", user.id);
```

### Measurements Query Update Example
```typescript
// Before
.from("profiles")
.select("measurements")
.eq("id", userId)

// After
.from("profile_measurements")
.select("*")
.eq("user_id", userId)
```