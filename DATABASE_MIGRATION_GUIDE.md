# Database Migration Guide - Public Lawyer Profiles

## Overview

This guide helps you apply the database changes required for the public lawyer profile feature.

## Migration File

**File:** `scripts/014_add_location_fields.sql`

## What It Does

Adds location-related columns to the `lawyer_profiles` table:
- `latitude` - Office GPS latitude (decimal)
- `longitude` - Office GPS longitude (decimal)
- `location_visibility` - Whether to show location to clients (boolean)
- `office_address` - Physical office address (text)

## Pre-Migration Checklist

- [ ] Backup your database
- [ ] Review the SQL file
- [ ] Test on development environment first
- [ ] Ensure you have database admin access
- [ ] Check for any active connections

## Migration Steps

### Option 1: Using psql (Command Line)

```bash
# Connect to your database and run the migration
psql -h your-database-host \
     -U your-database-user \
     -d your-database-name \
     -f scripts/014_add_location_fields.sql
```

### Option 2: Using Supabase Dashboard

1. Log into your Supabase dashboard
2. Go to SQL Editor
3. Open `scripts/014_add_location_fields.sql`
4. Copy the entire content
5. Paste into SQL Editor
6. Click "Run"

### Option 3: Using pgAdmin

1. Open pgAdmin
2. Connect to your database
3. Right-click on your database → Query Tool
4. File → Open → Select `scripts/014_add_location_fields.sql`
5. Click Execute (F5)

## Verification

After running the migration, verify the changes:

```sql
-- Check that columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'lawyer_profiles'
  AND column_name IN ('latitude', 'longitude', 'location_visibility', 'office_address');
```

Expected output:
```
column_name          | data_type | is_nullable
---------------------|-----------|-------------
latitude             | numeric   | YES
longitude            | numeric   | YES
location_visibility  | boolean   | NO
office_address       | text      | YES
```

## Rollback (If Needed)

If you need to undo the migration:

```sql
-- Remove the added columns
ALTER TABLE public.lawyer_profiles 
  DROP COLUMN IF EXISTS latitude,
  DROP COLUMN IF EXISTS longitude,
  DROP COLUMN IF EXISTS location_visibility,
  DROP COLUMN IF EXISTS office_address;

-- Remove the index
DROP INDEX IF EXISTS idx_lawyer_profiles_location;
```

## Post-Migration Tasks

1. **Update TypeScript Types**
   - Already done in `lib/database.types.ts`
   - Types include the new fields

2. **Test in Development**
   ```bash
   # Start dev server
   pnpm dev
   
   # Test these scenarios:
   # - Edit lawyer profile (add location)
   # - View public profile with location
   # - Test without location (privacy off)
   ```

3. **Data Population (Optional)**
   ```sql
   -- Set default values for existing lawyers (optional)
   UPDATE public.lawyer_profiles
   SET location_visibility = false
   WHERE location_visibility IS NULL;
   ```

## Migration Timeline

**Estimated time:** 1-5 seconds (depending on database size)

**Downtime required:** None (adding nullable columns is safe)

**Data impact:** None (no existing data is modified)

## Common Issues & Solutions

### Issue 1: Permission Denied
```
ERROR: permission denied for table lawyer_profiles
```

**Solution:** Ensure your database user has ALTER TABLE permissions:
```sql
GRANT ALTER ON TABLE public.lawyer_profiles TO your_user;
```

### Issue 2: Table Not Found
```
ERROR: relation "public.lawyer_profiles" does not exist
```

**Solution:** 
- Check that you're connected to the correct database
- Verify the table name is correct
- Run earlier migrations first

### Issue 3: Column Already Exists
```
ERROR: column "latitude" of relation "lawyer_profiles" already exists
```

**Solution:** Migration was already applied. Check with:
```sql
\d lawyer_profiles
```

### Issue 4: Index Already Exists
```
NOTICE: relation "idx_lawyer_profiles_location" already exists, skipping
```

**Solution:** This is just a notice, not an error. Migration is safe.

## Best Practices

✅ **Do:**
- Backup database before migration
- Test on development first
- Run during low-traffic hours
- Verify results after migration
- Keep migration logs

❌ **Don't:**
- Run migrations directly on production without testing
- Skip backups
- Modify the migration file without testing
- Run multiple times without checking
- Ignore warnings or errors

## Production Deployment Checklist

Before deploying to production:

- [ ] Migration tested in development
- [ ] Database backup created
- [ ] Team notified of deployment
- [ ] Rollback plan prepared
- [ ] Monitoring in place
- [ ] Off-peak time scheduled

During deployment:

- [ ] Run migration
- [ ] Verify columns added
- [ ] Test lawyer profile edit
- [ ] Test public profile view
- [ ] Check error logs
- [ ] Test on mobile

After deployment:

- [ ] Monitor for errors
- [ ] Check database performance
- [ ] Verify feature works
- [ ] Update documentation
- [ ] Notify team of completion

## Support

If you encounter issues:

1. Check the error message carefully
2. Review this migration guide
3. Check database logs
4. Verify database permissions
5. Test with a simple SELECT query
6. Consult the main documentation

## Migration History

| Version | Date | Description |
|---------|------|-------------|
| 014 | 2025-12-31 | Add location fields for public profiles |

## Related Files

- `scripts/014_add_location_fields.sql` - Migration file
- `lib/database.types.ts` - Updated TypeScript types
- `PUBLIC_LAWYER_PROFILE_FEATURE.md` - Feature documentation
- `QUICK_START_PUBLIC_PROFILES.md` - User guide

---

**Status:** Ready to apply ✅

**Risk Level:** Low (non-breaking changes)

**Reversible:** Yes (rollback available)
