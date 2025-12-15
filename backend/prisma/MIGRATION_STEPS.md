# Schema Optimization Migration Steps

## Overview

This document provides step-by-step instructions to migrate from the old schema to the optimized schema.

## Pre-Migration Checklist

- [ ] Backup current database
- [ ] Backup current schema
- [ ] Review all changes in SCHEMA_OPTIMIZATION_GUIDE.md
- [ ] Ensure no active users in the system
- [ ] Stop all running services

## Step 1: Backup

```bash
# Navigate to backend directory
cd backend

# Backup database
cp prisma/dev.db prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)

# Backup old schema (already done)
# schema_old.prisma contains the original schema
```

## Step 2: Validate New Schema

```bash
# Format the schema
npx prisma format

# Validate schema syntax
npx prisma validate
```

## Step 3: Generate Migration

```bash
# Create migration
npx prisma migrate dev --name optimize_schema_with_enums_json_softdelete_audit

# This will:
# 1. Create migration SQL files
# 2. Apply migration to database
# 3. Generate new Prisma Client
```

## Step 4: Review Migration SQL

Check the generated migration file in `prisma/migrations/` to ensure:
- Enums are created correctly
- JSON columns are properly typed
- Indexes are added
- deletedAt columns are added
- createdBy/updatedBy columns are added

## Step 5: Apply Migration

If you skipped auto-apply in step 3:

```bash
npx prisma migrate deploy
```

## Step 6: Generate Prisma Client

```bash
npx prisma generate
```

## Step 7: Update Application Code

### 7.1 Update Enum References

Search and replace throughout the codebase:

```bash
# Example replacements needed:
# 'consultation' → 'CONSULTATION'
# 'scheduled' → 'SCHEDULED'
# 'male' → 'MALE'
# 'upa' → 'UPA'
```

### 7.2 Update JSON Field Handling

Remove JSON.parse() and JSON.stringify() for fields now using Json type:

```typescript
// Before
const patient = await prisma.patient.create({
  data: {
    allergies: JSON.stringify(['penicillin'])
  }
});
const allergies = JSON.parse(patient.allergies);

// After
const patient = await prisma.patient.create({
  data: {
    allergies: ['penicillin']
  }
});
const allergies = patient.allergies; // Already an array
```

### 7.3 Implement Soft Delete Queries

Update all queries to exclude soft-deleted records:

```typescript
// Create a utility function
export function excludeDeleted<T>(where?: T): T & { deletedAt: null } {
  return {
    ...where,
    deletedAt: null
  } as T & { deletedAt: null };
}

// Use in queries
const patients = await prisma.patient.findMany({
  where: excludeDeleted({ isActive: true })
});
```

### 7.4 Add Audit Trail

Update create/update operations to include audit fields:

```typescript
// Create middleware for automatic audit
prisma.$use(async (params, next) => {
  const userId = getCurrentUserId(); // Implement this based on your auth
  
  if (params.action === 'create') {
    params.args.data = {
      ...params.args.data,
      createdBy: userId
    };
  }
  
  if (params.action === 'update' || params.action === 'updateMany') {
    params.args.data = {
      ...params.args.data,
      updatedBy: userId
    };
  }
  
  return next(params);
});
```

## Step 8: Update Tests

Update all test files to:
- Use new enum values (UPPERCASE)
- Handle JSON fields correctly
- Include deletedAt: null in queries
- Test soft delete functionality
- Test audit trail

## Step 9: Verify Migration

```bash
# Run tests
npm test

# Check database structure
npx prisma studio

# Verify data integrity
npx prisma db execute --stdin < verify_migration.sql
```

## Step 10: Deploy to Production

### 10.1 Production Backup

```bash
# Backup production database before migration
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 10.2 Apply Migration

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Apply migration
npx prisma migrate deploy

# Generate client
npx prisma generate
```

### 10.3 Verify Production

- Check application logs
- Test critical flows
- Monitor error rates
- Verify data integrity

## Rollback Plan

If issues occur:

### Development Rollback

```bash
# Restore database
cp prisma/dev.db.backup.TIMESTAMP prisma/dev.db

# Restore old schema
cp prisma/schema_old.prisma prisma/schema.prisma

# Regenerate client
npx prisma generate
```

### Production Rollback

```bash
# Restore database from backup
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup_TIMESTAMP.sql

# Deploy old schema
git checkout HEAD~1 prisma/schema.prisma
npx prisma migrate deploy
npx prisma generate
```

## Common Issues and Solutions

### Issue 1: Enum Value Mismatch

**Error:** Invalid enum value

**Solution:** Update all hardcoded strings to use UPPERCASE enum values

### Issue 2: JSON Parse Error

**Error:** Unexpected token in JSON

**Solution:** Remove JSON.parse() calls for Json type fields

### Issue 3: Soft Delete Not Working

**Error:** Deleted records still appearing

**Solution:** Add `deletedAt: null` to all queries or use the excludeDeleted utility

### Issue 4: Missing Audit Fields

**Error:** createdBy/updatedBy is null

**Solution:** Implement Prisma middleware to automatically populate audit fields

## Verification Queries

```sql
-- Check enum values
SELECT DISTINCT type FROM attendances;
SELECT DISTINCT status FROM attendances;

-- Check JSON fields
SELECT allergies FROM patients LIMIT 5;

-- Check soft delete
SELECT COUNT(*) FROM patients WHERE deletedAt IS NULL;
SELECT COUNT(*) FROM patients WHERE deletedAt IS NOT NULL;

-- Check audit fields
SELECT createdBy, updatedBy FROM patients WHERE createdBy IS NOT NULL LIMIT 5;

-- Check indexes
.indexes attendances
```

## Post-Migration Tasks

- [ ] Update API documentation
- [ ] Update frontend enum mappings
- [ ] Train team on new soft delete behavior
- [ ] Monitor performance improvements
- [ ] Document any custom migration steps taken

## Support

If you encounter issues:
1. Check the SCHEMA_OPTIMIZATION_GUIDE.md
2. Review migration SQL files
3. Check application logs
4. Verify Prisma Client version matches schema

## Success Criteria

Migration is successful when:
- [ ] All tests pass
- [ ] No runtime errors in logs
- [ ] Data integrity verified
- [ ] Performance metrics improved
- [ ] Soft delete working correctly
- [ ] Audit trail capturing changes
- [ ] JSON fields working without parsing
- [ ] Enums providing type safety
