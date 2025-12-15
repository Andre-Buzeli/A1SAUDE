/**
 * Prisma Audit Middleware
 * 
 * Automatically populates createdBy and updatedBy fields
 * for all create and update operations.
 */

import { Prisma } from '@prisma/client';

/**
 * Context type for passing user information
 */
export interface AuditContext {
  userId?: string | null;
}

/**
 * Creates a Prisma middleware that automatically adds audit fields
 * 
 * @param getUserId - Function that returns the current user ID
 * @returns Prisma middleware function
 * 
 * @example
 * import { PrismaClient } from '@prisma/client';
 * import { createAuditMiddleware } from './middlewares/prismaAuditMiddleware';
 * 
 * const prisma = new PrismaClient();
 * 
 * // Option 1: With a function that gets user ID from context
 * prisma.$use(createAuditMiddleware(() => getCurrentUserId()));
 * 
 * // Option 2: With async context (e.g., AsyncLocalStorage)
 * prisma.$use(createAuditMiddleware(() => asyncLocalStorage.getStore()?.userId));
 */
export function createAuditMiddleware(
  getUserId: () => string | null | undefined
): Prisma.Middleware {
  return async (params, next) => {
    const userId = getUserId();

    // Only add audit fields if we have a user ID
    if (!userId) {
      return next(params);
    }

    // Handle create operations
    if (params.action === 'create') {
      // Check if the model has createdBy field
      if (params.args.data && typeof params.args.data === 'object') {
        params.args.data = {
          ...params.args.data,
          createdBy: userId,
        };
      }
    }

    // Handle update operations
    if (params.action === 'update') {
      if (params.args.data && typeof params.args.data === 'object') {
        params.args.data = {
          ...params.args.data,
          updatedBy: userId,
        };
      }
    }

    // Handle updateMany operations
    if (params.action === 'updateMany') {
      if (params.args.data && typeof params.args.data === 'object') {
        params.args.data = {
          ...params.args.data,
          updatedBy: userId,
        };
      }
    }

    // Handle upsert operations
    if (params.action === 'upsert') {
      if (params.args.create && typeof params.args.create === 'object') {
        params.args.create = {
          ...params.args.create,
          createdBy: userId,
        };
      }
      if (params.args.update && typeof params.args.update === 'object') {
        params.args.update = {
          ...params.args.update,
          updatedBy: userId,
        };
      }
    }

    return next(params);
  };
}

/**
 * Creates a Prisma middleware with async context support
 * 
 * @param getContext - Async function that returns audit context
 * @returns Prisma middleware function
 * 
 * @example
 * import { AsyncLocalStorage } from 'async_hooks';
 * 
 * const asyncLocalStorage = new AsyncLocalStorage<AuditContext>();
 * 
 * prisma.$use(createAsyncAuditMiddleware(async () => {
 *   return asyncLocalStorage.getStore();
 * }));
 */
export function createAsyncAuditMiddleware(
  getContext: () => Promise<AuditContext | undefined>
): Prisma.Middleware {
  return async (params, next) => {
    const context = await getContext();
    const userId = context?.userId;

    if (!userId) {
      return next(params);
    }

    // Same logic as createAuditMiddleware
    if (params.action === 'create') {
      if (params.args.data && typeof params.args.data === 'object') {
        params.args.data = {
          ...params.args.data,
          createdBy: userId,
        };
      }
    }

    if (params.action === 'update' || params.action === 'updateMany') {
      if (params.args.data && typeof params.args.data === 'object') {
        params.args.data = {
          ...params.args.data,
          updatedBy: userId,
        };
      }
    }

    if (params.action === 'upsert') {
      if (params.args.create && typeof params.args.create === 'object') {
        params.args.create = {
          ...params.args.create,
          createdBy: userId,
        };
      }
      if (params.args.update && typeof params.args.update === 'object') {
        params.args.update = {
          ...params.args.update,
          updatedBy: userId,
        };
      }
    }

    return next(params);
  };
}

/**
 * Models that should have audit fields
 * Add or remove models as needed
 */
export const AUDITABLE_MODELS = [
  'establishment',
  'user',
  'patient',
  'unit',
  'attendance',
  'prescription',
  'medicationAdministration',
  'medicationSchedule',
  'examRequest',
  'bed',
  'admission',
  'budget',
  'expense',
  'contract',
  'diseaseNotification',
  'medicalEvolution',
  'document',
  'employee',
  'vacation',
  'leave',
  'workSchedule',
  'homeVisit',
  'surgery',
  'imagingExam',
  'vaccination',
  'healthProgram',
  'programEnrollment',
  'dentalAttendance',
  'labExam',
  'pharmacyProduct',
  'medicationRoom',
  'minorSurgery',
  'emergencyAttendance',
];

/**
 * Creates a selective audit middleware that only applies to specific models
 * 
 * @param getUserId - Function that returns the current user ID
 * @param models - Array of model names to apply audit to (defaults to AUDITABLE_MODELS)
 * @returns Prisma middleware function
 * 
 * @example
 * prisma.$use(createSelectiveAuditMiddleware(
 *   () => getCurrentUserId(),
 *   ['patient', 'attendance', 'prescription']
 * ));
 */
export function createSelectiveAuditMiddleware(
  getUserId: () => string | null | undefined,
  models: string[] = AUDITABLE_MODELS
): Prisma.Middleware {
  const modelSet = new Set(models.map((m) => m.toLowerCase()));

  return async (params, next) => {
    // Check if this model should have audit fields
    if (!modelSet.has(params.model?.toLowerCase() || '')) {
      return next(params);
    }

    const userId = getUserId();

    if (!userId) {
      return next(params);
    }

    // Same audit logic as before
    if (params.action === 'create') {
      if (params.args.data && typeof params.args.data === 'object') {
        params.args.data = {
          ...params.args.data,
          createdBy: userId,
        };
      }
    }

    if (params.action === 'update' || params.action === 'updateMany') {
      if (params.args.data && typeof params.args.data === 'object') {
        params.args.data = {
          ...params.args.data,
          updatedBy: userId,
        };
      }
    }

    if (params.action === 'upsert') {
      if (params.args.create && typeof params.args.create === 'object') {
        params.args.create = {
          ...params.args.create,
          createdBy: userId,
        };
      }
      if (params.args.update && typeof params.args.update === 'object') {
        params.args.update = {
          ...params.args.update,
          updatedBy: userId,
        };
      }
    }

    return next(params);
  };
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Basic usage with Express
import { PrismaClient } from '@prisma/client';
import { createAuditMiddleware } from './middlewares/prismaAuditMiddleware';

const prisma = new PrismaClient();

// Assuming you have a way to get current user ID
let currentUserId: string | null = null;

export function setCurrentUserId(userId: string | null) {
  currentUserId = userId;
}

export function getCurrentUserId() {
  return currentUserId;
}

prisma.$use(createAuditMiddleware(getCurrentUserId));

// In your auth middleware
app.use((req, res, next) => {
  if (req.user) {
    setCurrentUserId(req.user.id);
  }
  next();
});

// Example 2: With AsyncLocalStorage (recommended for concurrent requests)
import { AsyncLocalStorage } from 'async_hooks';
import { AuditContext } from './middlewares/prismaAuditMiddleware';

const asyncLocalStorage = new AsyncLocalStorage<AuditContext>();

prisma.$use(createAuditMiddleware(() => {
  return asyncLocalStorage.getStore()?.userId;
}));

// In your auth middleware
app.use((req, res, next) => {
  const context: AuditContext = {
    userId: req.user?.id
  };
  asyncLocalStorage.run(context, () => next());
});

// Example 3: Selective audit (only specific models)
prisma.$use(createSelectiveAuditMiddleware(
  getCurrentUserId,
  ['patient', 'attendance', 'prescription', 'medicalEvolution']
));
*/
