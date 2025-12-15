# SQLite-Compatible Schema Optimizations

## Changes Applied

This document describes the optimizations that CAN be applied to SQLite.

### 1. Soft Delete Implementation

Add `deletedAt` field to all main models:

```prisma
// Add to each model
deletedAt DateTime?

// Add index
@@index([deletedAt])
```

**Models to update:**
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
- Vacation
- Leave
- WorkSchedule
- HomeVisit
- Surgery
- ImagingExam
- Vaccination
- HealthProgram
- ProgramEnrollment
- DentalAttendance
- LabExam
- PharmacyProduct
- MedicationRoom
- MinorSurgery
- EmergencyAttendance

### 2. Audit Fields

Add `createdBy` and `updatedBy` fields:

```prisma
// Add to each model (after deletedAt, before createdAt)
createdBy String?
updatedBy String?
```

**Same models as soft delete**

### 3. Performance Indexes

Add composite and single indexes for common queries:

```prisma
// Attendance
@@index([patientId, startTime])
@@index([professionalId, startTime])
@@index([establishmentId, status])
@@index([startTime])
@@index([status])

// User
@@index([establishmentId, isActive])
@@index([profile, establishmentType])

// Patient
@@index([cpf])
@@index([name])

// Prescription
@@index([patientId, status])
@@index([professionalId])

// MedicationAdministration
@@index([patientId, scheduledFor])
@@index([status])

// ExamRequest
@@index([patientId, status])
@@index([status])

// VitalSigns
@@index([patientId, recordedAt])

// Triage
@@index([patientId])
@@index([priority])

// Bed
@@index([status, isActive])

// Admission
@@index([patientId, status])
@@index([status])

// Session
@@index([userId, isActive])
@@index([expiresAt])

// AuditLog
@@index([userId, createdAt])
@@index([resource, resourceId])
@@index([createdAt])

// Budget
@@index([establishmentId, year, month])

// Expense
@@index([establishmentId, status])
@@index([expenseDate])

// Contract
@@index([establishmentId, status])
@@index([endDate])

// DiseaseNotification
@@index([establishmentId, epidemiologicalYear, epidemiologicalWeek])
@@index([diseaseCode])

// SyncEvent
@@index([synced, timestamp])
@@index([establishmentId])

// OfflineCache
@@index([expiresAt])
@@index([lastAccessed])

// OfflineOperation
@@index([status, timestamp])

// MedicalEvolution
@@index([patientId, createdAt])

// Document
@@index([patientId, category])

// Employee
@@index([establishmentId, isActive])

// TimeRecord
@@index([employeeId, date])

// Vacation
@@index([employeeId, status])

// Leave
@@index([employeeId, status])

// WorkSchedule
@@index([establishmentId, isActive])

// ScheduleAssignment
@@index([employeeId, date])

// Payroll
@@index([employeeId, referenceYear, referenceMonth])
@@index([status])

// HomeVisit
@@index([patientId, scheduledDate])
@@index([status])

// Surgery
@@index([patientId, scheduledDate])
@@index([status])

// ImagingExam
@@index([patientId, status])
@@index([status])

// Vaccination
@@index([patientId, applicationDate])
@@index([vaccineCode])

// HealthProgram
@@index([establishmentId, isActive])

// ProgramEnrollment
@@index([patientId, status])

// DentalAttendance
@@index([patientId, createdAt])
@@index([status])

// LabExam
@@index([patientId, status])
@@index([status])

// PharmacyProduct
@@index([establishmentId, isActive])

// ProductBatch
@@index([productId, status])
@@index([expirationDate])

// StockMovement
@@index([productId, performedAt])
@@index([establishmentId, performedAt])

// MedicationRoom
@@index([patientId, scheduledTime])
@@index([status])

// MinorSurgery
@@index([patientId, scheduledFor])
@@index([status])

// EmergencyAttendance
@@index([patientId, arrivalTime])
@@index([status])
@@index([manchesterColor])
```

### 4. Remove @db.Date

Remove `@db.Date` from TimeRecord and ScheduleAssignment:

```prisma
// Before
date DateTime @db.Date

// After  
date DateTime
```

## Manual Application Steps

Since the schema is large, apply these changes manually or use a script:

1. Open `backend/prisma/schema.prisma`
2. For each model listed above:
   - Add `deletedAt DateTime?` before `createdAt`
   - Add `createdBy String?` and `updatedBy String?` after `deletedAt`
   - Add `@@index([deletedAt])` in the `@@` section
   - Add other relevant indexes from the list above
3. Remove `@db.Date` from TimeRecord and ScheduleAssignment
4. Run `npx prisma format`
5. Run `npx prisma migrate dev --name add_soft_delete_audit_indexes`

## Validation Script

After applying changes, validate with:

```bash
npx prisma validate
npx prisma format
```

## Application Code Changes

### Soft Delete Utility

```typescript
// src/utils/softDelete.ts
export function excludeDeleted<T>(where?: T) {
  return {
    ...where,
    deletedAt: null
  };
}

// Usage
const patients = await prisma.patient.findMany({
  where: excludeDeleted({ isActive: true })
});
```

### Audit Middleware

```typescript
// src/middlewares/auditMiddleware.ts
export function createAuditMiddleware(getUserId: () => string | null) {
  return async (params: any, next: any) => {
    const userId = getUserId();
    
    if (params.action === 'create' && userId) {
      params.args.data = {
        ...params.args.data,
        createdBy: userId
      };
    }
    
    if ((params.action === 'update' || params.action === 'updateMany') && userId) {
      params.args.data = {
        ...params.args.data,
        updatedBy: userId
      };
    }
    
    return next(params);
  };
}

// Apply middleware
prisma.$use(createAuditMiddleware(() => getCurrentUserId()));
```

### Enum Validation with Zod

```typescript
// src/validators/enums.ts
import { z } from 'zod';

export const AttendanceTypeSchema = z.enum([
  'consultation',
  'emergency',
  'procedure',
  'surgery',
  'exam',
  'vaccination'
]);

export const AttendanceStatusSchema = z.enum([
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
]);

// Usage in validation
const createAttendanceSchema = z.object({
  type: AttendanceTypeSchema,
  status: AttendanceStatusSchema,
  // ... other fields
});
```

## Benefits Achieved

Even without native Json and enums, we get:

✅ **Soft Delete**: Preserve data while marking as deleted
✅ **Audit Trail**: Track who created/modified records  
✅ **Performance**: Optimized indexes for common queries
✅ **Data Integrity**: Application-level validation with Zod
✅ **Type Safety**: TypeScript types for enum values

## Production Migration

When moving to PostgreSQL production:
1. Use the full optimized schema with native Json and enums
2. Migrate data from SQLite to PostgreSQL
3. Benefit from database-level type checking and validation
