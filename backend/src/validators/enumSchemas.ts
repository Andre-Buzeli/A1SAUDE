/**
 * Enum Validation Schemas
 * 
 * Zod schemas for validating enum-like string fields in SQLite.
 * When migrating to PostgreSQL, these can be replaced with native enums.
 */

import { z } from 'zod';

// ============================================================================
// ESTABLISHMENT & USER ENUMS
// ============================================================================

export const EstablishmentTypeSchema = z.enum(['upa', 'ubs', 'hospital']);
export type EstablishmentType = z.infer<typeof EstablishmentTypeSchema>;

export const UserProfileSchema = z.enum([
  'gestor_geral',
  'diretor_local',
  'gestor_local',
  'medico',
  'enfermeiro',
  'tecnico_enfermagem',
  'recepcionista',
  'farmaceutico',
  'dentista',
  'acs',
]);
export type UserProfile = z.infer<typeof UserProfileSchema>;

// ============================================================================
// PATIENT ENUMS
// ============================================================================

export const GenderSchema = z.enum(['male', 'female', 'other']);
export type Gender = z.infer<typeof GenderSchema>;

export const MaritalStatusSchema = z.enum([
  'single',
  'married',
  'divorced',
  'widowed',
  'other',
]);
export type MaritalStatus = z.infer<typeof MaritalStatusSchema>;

export const BloodTypeSchema = z.enum([
  'A_POSITIVE',
  'A_NEGATIVE',
  'B_POSITIVE',
  'B_NEGATIVE',
  'AB_POSITIVE',
  'AB_NEGATIVE',
  'O_POSITIVE',
  'O_NEGATIVE',
]);
export type BloodType = z.infer<typeof BloodTypeSchema>;

// ============================================================================
// ATTENDANCE ENUMS
// ============================================================================

export const AttendanceTypeSchema = z.enum([
  'consultation',
  'emergency',
  'procedure',
  'surgery',
  'exam',
  'vaccination',
]);
export type AttendanceType = z.infer<typeof AttendanceTypeSchema>;

export const AttendanceStatusSchema = z.enum([
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]);
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

// ============================================================================
// PRESCRIPTION ENUMS
// ============================================================================

export const PrescriptionStatusSchema = z.enum([
  'active',
  'completed',
  'cancelled',
  'expired',
]);
export type PrescriptionStatus = z.infer<typeof PrescriptionStatusSchema>;

export const MedicationAdministrationStatusSchema = z.enum([
  'scheduled',
  'administered',
  'cancelled',
  'refused',
]);
export type MedicationAdministrationStatus = z.infer<
  typeof MedicationAdministrationStatusSchema
>;

// ============================================================================
// EXAM ENUMS
// ============================================================================

export const ExamRequestStatusSchema = z.enum([
  'requested',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
]);
export type ExamRequestStatus = z.infer<typeof ExamRequestStatusSchema>;

// ============================================================================
// TRIAGE ENUMS
// ============================================================================

export const TriagePrioritySchema = z.enum([
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
]);
export type TriagePriority = z.infer<typeof TriagePrioritySchema>;

// ============================================================================
// BED & ADMISSION ENUMS
// ============================================================================

export const BedStatusSchema = z.enum([
  'available',
  'occupied',
  'maintenance',
  'reserved',
]);
export type BedStatus = z.infer<typeof BedStatusSchema>;

export const AdmissionStatusSchema = z.enum([
  'active',
  'discharged',
  'transferred',
]);
export type AdmissionStatus = z.infer<typeof AdmissionStatusSchema>;

// ============================================================================
// FINANCIAL ENUMS
// ============================================================================

export const ContractStatusSchema = z.enum([
  'active',
  'expired',
  'cancelled',
  'suspended',
]);
export type ContractStatus = z.infer<typeof ContractStatusSchema>;

export const ExpenseStatusSchema = z.enum([
  'pending',
  'approved',
  'paid',
  'rejected',
]);
export type ExpenseStatus = z.infer<typeof ExpenseStatusSchema>;

// ============================================================================
// SYNC ENUMS
// ============================================================================

export const SyncStatusSchema = z.enum(['pending', 'completed', 'failed']);
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates an enum value and returns it if valid
 * Throws a validation error if invalid
 */
export function validateEnum<T extends z.ZodEnum<any>>(
  schema: T,
  value: unknown,
  fieldName: string = 'field'
): z.infer<T> {
  const result = schema.safeParse(value);
  
  if (!result.success) {
    const validValues = schema.options.join(', ');
    throw new Error(
      `Invalid ${fieldName}: "${value}". Must be one of: ${validValues}`
    );
  }
  
  return result.data;
}

/**
 * Checks if a value is a valid enum value
 * Returns true/false without throwing
 */
export function isValidEnum<T extends z.ZodEnum<any>>(
  schema: T,
  value: unknown
): boolean {
  return schema.safeParse(value).success;
}

/**
 * Gets all valid values for an enum schema
 */
export function getEnumValues<T extends z.ZodEnum<any>>(
  schema: T
): readonly string[] {
  return schema.options;
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Validate in controller
import { AttendanceTypeSchema, validateEnum } from '@/validators/enumSchemas';

const type = validateEnum(AttendanceTypeSchema, req.body.type, 'attendance type');

// Example 2: Use in Zod schema
import { z } from 'zod';
import { AttendanceTypeSchema, AttendanceStatusSchema } from '@/validators/enumSchemas';

const createAttendanceSchema = z.object({
  type: AttendanceTypeSchema,
  status: AttendanceStatusSchema,
  patientId: z.string().cuid(),
  // ... other fields
});

// Example 3: Check validity
import { isValidEnum, AttendanceTypeSchema } from '@/validators/enumSchemas';

if (!isValidEnum(AttendanceTypeSchema, userInput)) {
  return res.status(400).json({ error: 'Invalid attendance type' });
}

// Example 4: Get valid values for error messages
import { getEnumValues, AttendanceTypeSchema } from '@/validators/enumSchemas';

const validTypes = getEnumValues(AttendanceTypeSchema);
console.log(`Valid types: ${validTypes.join(', ')}`);
*/
