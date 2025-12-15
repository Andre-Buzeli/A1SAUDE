# Prisma Schema Optimization Guide

## Overview

This document describes the optimizations made to the Prisma schema according to task 4 requirements.

## Changes Implemented

### 1. Native Enums

Converted string-based enums to native Prisma enums for better type safety and database optimization:

```prisma
// Before
model Attendance {
  type   String // "consultation" | "emergency" | ...
  status String // "scheduled" | "in_progress" | ...
}

// After
enum AttendanceType {
  CONSULTATION
  EMERGENCY
  PROCEDURE
  SURGERY
  EXAM
  VACCINATION
}

enum AttendanceStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

model Attendance {
  type   AttendanceType
  status AttendanceStatus @default(SCHEDULED)
}
```

**Enums Created:**
- `EstablishmentType` (UPA, UBS, HOSPITAL)
- `UserProfile` (GESTOR_GERAL, DIRETOR_LOCAL, etc.)
- `Gender` (MALE, FEMALE, OTHER)
- `MaritalStatus` (SINGLE, MARRIED, DIVORCED, WIDOWED, OTHER)
- `BloodType` (A_POSITIVE, A_NEGATIVE, etc.)
- `AttendanceType`
- `AttendanceStatus`
- `PrescriptionStatus`
- `ExamRequestStatus`
- `TriagePriority`
- `BedStatus`
- `AdmissionStatus`
- `MedicationAdministrationStatus`
- `ContractStatus`
- `ExpenseStatus`
- `SyncStatus`

### 2. JSON Native Type

Converted String fields storing JSON to native Json type:

```prisma
// Before
model Patient {
  allergies         String // JSON string
  chronicConditions String // JSON string
  medications       String // JSON string
  emergencyContact  String? // JSON string
}

// After
model Patient {
  allergies         Json @default("[]")
  chronicConditions Json @default("[]")
  medications       Json @default("[]")
  emergencyContact  Json?
}
```

**Fields Converted:**
- `Establishment`: operatingHours, services, capacity
- `Patient`: allergies, chronicConditions, medications, emergencyContact
- `Prescription`: medications
- `MedicationSchedule`: scheduledTimes
- `ExamRequest`: results
- `Triage`: vitalSigns, symptoms, riskFactors
- `AuditLog`: changes, details
- `DiseaseNotification`: riskFactors, symptoms, labResults
- `SyncEvent`: data
- `OfflineCache`: data, tags
- `OfflineOperation`: data
- `MedicalEvolution`: soapSubjective, soapObjective, soapAssessment, soapPlan
- `Employee`: documents
- And many more...

### 3. Soft Delete Implementation

Added `deletedAt` field to all main tables for soft delete functionality:

```prisma
// Before
model Patient {
  id        String   @id @default(cuid())
  name      String
  // ... other fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// After
model Patient {
  id        String   @id @default(cuid())
  name      String
  // ... other fields
  
  // Soft delete
  deletedAt DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([deletedAt])
}
```

**Tables with Soft Delete:**
- Establishment
- User
- Patient
- Unit
- Attendance
- Prescription
- MedicationAdministration
- MedicationSchedule
- ExamRequest
- Bed
- Admission
- Budget
- Expense
- Contract
- DiseaseNotification
- MedicalEvolution
- Document
- Employee
- And all other main entities

### 4. Audit Fields

Added `createdBy` and `updatedBy` fields for audit trail:

```prisma
// Before
model Attendance {
  id        String   @id @default(cuid())
  // ... other fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// After
model Attendance {
  id        String   @id @default(cuid())
  // ... other fields
  
  // Audit fields
  createdBy String?
  updatedBy String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Note:** Fields are nullable (String?) to allow system-generated records and backward compatibility.

### 5. Performance Indexes

Added composite and single-column indexes for frequently queried fields:

```prisma
model Attendance {
  // ... fields
  
  @@index([deletedAt])
  @@index([patientId, startTime])
  @@index([professionalId, startTime])
  @@index([establishmentId, status])
  @@index([startTime])
  @@index([status])
}
```

**Index Strategy:**
- Soft delete index on all tables with `deletedAt`
- Composite indexes for common query patterns
- Foreign key indexes for join optimization
- Status and date-based indexes for filtering

## Migration Steps

### Step 1: Backup Current Database

```bash
# Backup SQLite database
cp backend/prisma/dev.db backend/prisma/dev.db.backup

# Backup schema
cp backend/prisma/schema.prisma backend/prisma/schema.prisma.backup
```

### Step 2: Replace Schema

```bash
# Replace old schema with optimized version
cp backend/prisma/schema_optimized.prisma backend/prisma/schema.prisma
```

### Step 3: Generate Migration

```bash
cd backend
npx prisma migrate dev --name optimize_schema
```

### Step 4: Update Application Code

#### 4.1 Update Enum References

```typescript
// Before
const attendance = await prisma.attendance.create({
  data: {
    type: 'consultation',
    status: 'scheduled'
  }
});

// After
const attendance = await prisma.attendance.create({
  data: {
    type: 'CONSULTATION',
    status: 'SCHEDULED'
  }
});
```

#### 4.2 Update JSON Field Access

```typescript
// Before
const allergies = JSON.parse(patient.allergies);

// After
const allergies = patient.allergies; // Already parsed
```

#### 4.3 Implement Soft Delete

```typescript
// Soft delete function
async function softDelete(model: string, id: string) {
  return prisma[model].update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}

// Query excluding soft deleted
const activePatients = await prisma.patient.findMany({
  where: { deletedAt: null }
});
```

#### 4.4 Add Audit Trail

```typescript
// Create with audit
async function createWithAudit(model: string, data: any, userId: string) {
  return prisma[model].create({
    data: {
      ...data,
      createdBy: userId
    }
  });
}

// Update with audit
async function updateWithAudit(model: string, id: string, data: any, userId: string) {
  return prisma[model].update({
    where: { id },
    data: {
      ...data,
      updatedBy: userId
    }
  });
}
```

## Breaking Changes

### 1. Enum Values

All enum values are now UPPERCASE. Update all hardcoded strings:

```typescript
// Update these patterns throughout the codebase
'consultation' → 'CONSULTATION'
'scheduled' → 'SCHEDULED'
'male' → 'MALE'
'upa' → 'UPA'
```

### 2. JSON Fields

JSON fields no longer need parsing/stringifying:

```typescript
// Before
data: { allergies: JSON.stringify(['penicillin']) }

// After
data: { allergies: ['penicillin'] }
```

### 3. Queries Must Exclude Soft Deleted

Add `deletedAt: null` to all queries:

```typescript
// Before
const patients = await prisma.patient.findMany();

// After
const patients = await prisma.patient.findMany({
  where: { deletedAt: null }
});
```

## Validation

### Test Checklist

- [ ] All enums are properly referenced in code
- [ ] JSON fields work without parsing
- [ ] Soft delete queries exclude deleted records
- [ ] Audit fields are populated on create/update
- [ ] Indexes improve query performance
- [ ] All existing tests pass
- [ ] Migration runs successfully

### Performance Verification

```sql
-- Check index usage
EXPLAIN QUERY PLAN 
SELECT * FROM attendances 
WHERE patientId = 'xxx' AND startTime > datetime('now');

-- Verify soft delete index
EXPLAIN QUERY PLAN
SELECT * FROM patients WHERE deletedAt IS NULL;
```

## Rollback Plan

If issues occur:

```bash
# Restore backup
cp backend/prisma/dev.db.backup backend/prisma/dev.db
cp backend/prisma/schema.prisma.backup backend/prisma/schema.prisma

# Regenerate Prisma Client
npx prisma generate
```

## Benefits

1. **Type Safety**: Native enums provide compile-time type checking
2. **Performance**: Proper indexes speed up common queries
3. **Data Integrity**: JSON validation at database level
4. **Audit Trail**: Track who created/modified records
5. **Soft Delete**: Preserve data while marking as deleted
6. **Query Optimization**: Composite indexes for common patterns

## Requirements Satisfied

- ✅ 2.1: Convert JSON String fields to native Json type
- ✅ 2.5: Add native enums for status and types
- ✅ Soft delete with deletedAt field
- ✅ Audit fields (createdBy, updatedBy)
- ✅ Performance indexes for optimization
