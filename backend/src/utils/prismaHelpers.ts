/**
 * Prisma Helper Utilities
 * 
 * These utilities help implement schema optimizations at the application level,
 * especially for SQLite which doesn't support native Json and enum types.
 */

/**
 * Soft Delete Utility
 * 
 * Excludes soft-deleted records from queries by adding deletedAt: null condition
 * 
 * @example
 * const patients = await prisma.patient.findMany({
 *   where: excludeDeleted({ isActive: true })
 * });
 */
export function excludeDeleted<T extends Record<string, any>>(
  where?: T
): T & { deletedAt: null } {
  return {
    ...where,
    deletedAt: null,
  } as T & { deletedAt: null };
}

/**
 * Soft Delete a Record
 * 
 * Marks a record as deleted by setting deletedAt timestamp
 * 
 * @example
 * await softDelete(prisma.patient, 'patient-id', 'user-id');
 */
export async function softDelete(
  model: any,
  id: string,
  userId?: string
): Promise<any> {
  return model.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      updatedBy: userId,
    },
  });
}

/**
 * Restore a Soft-Deleted Record
 * 
 * Removes the deletedAt timestamp to restore a record
 * 
 * @example
 * await restoreDeleted(prisma.patient, 'patient-id', 'user-id');
 */
export async function restoreDeleted(
  model: any,
  id: string,
  userId?: string
): Promise<any> {
  return model.update({
    where: { id },
    data: {
      deletedAt: null,
      updatedBy: userId,
    },
  });
}

/**
 * Hard Delete a Record
 * 
 * Permanently deletes a record from the database
 * Use with caution - this cannot be undone
 * 
 * @example
 * await hardDelete(prisma.patient, 'patient-id');
 */
export async function hardDelete(model: any, id: string): Promise<any> {
  return model.delete({
    where: { id },
  });
}

/**
 * Get Current User ID
 * 
 * Helper to get the current user ID from request context
 * Implement this based on your authentication system
 * 
 * @example
 * const userId = getCurrentUserId(req);
 */
export function getCurrentUserId(context?: any): string | null {
  // TODO: Implement based on your auth system
  // Example with Express:
  // return context?.user?.id || null;
  
  // Example with JWT:
  // const token = context?.headers?.authorization?.split(' ')[1];
  // const decoded = jwt.verify(token, secret);
  // return decoded.userId;
  
  return null;
}

/**
 * Create with Audit
 * 
 * Creates a record with automatic audit trail
 * 
 * @example
 * const patient = await createWithAudit(
 *   prisma.patient,
 *   { name: 'John Doe', cpf: '12345678900' },
 *   'user-id'
 * );
 */
export async function createWithAudit(
  model: any,
  data: any,
  userId?: string
): Promise<any> {
  return model.create({
    data: {
      ...data,
      createdBy: userId,
    },
  });
}

/**
 * Update with Audit
 * 
 * Updates a record with automatic audit trail
 * 
 * @example
 * const patient = await updateWithAudit(
 *   prisma.patient,
 *   'patient-id',
 *   { name: 'Jane Doe' },
 *   'user-id'
 * );
 */
export async function updateWithAudit(
  model: any,
  id: string,
  data: any,
  userId?: string
): Promise<any> {
  return model.update({
    where: { id },
    data: {
      ...data,
      updatedBy: userId,
    },
  });
}

/**
 * Find Many with Soft Delete
 * 
 * Convenience method that automatically excludes deleted records
 * 
 * @example
 * const patients = await findManyActive(prisma.patient, {
 *   where: { isActive: true },
 *   take: 10
 * });
 */
export async function findManyActive(
  model: any,
  args?: any
): Promise<any[]> {
  return model.findMany({
    ...args,
    where: excludeDeleted(args?.where),
  });
}

/**
 * Find Unique with Soft Delete
 * 
 * Finds a unique record, excluding soft-deleted ones
 * 
 * @example
 * const patient = await findUniqueActive(prisma.patient, {
 *   where: { id: 'patient-id' }
 * });
 */
export async function findUniqueActive(
  model: any,
  args: any
): Promise<any | null> {
  const result = await model.findUnique(args);
  
  if (result && result.deletedAt) {
    return null;
  }
  
  return result;
}

/**
 * Count Active Records
 * 
 * Counts records excluding soft-deleted ones
 * 
 * @example
 * const count = await countActive(prisma.patient, {
 *   where: { isActive: true }
 * });
 */
export async function countActive(
  model: any,
  args?: any
): Promise<number> {
  return model.count({
    ...args,
    where: excludeDeleted(args?.where),
  });
}

/**
 * Paginate with Soft Delete
 * 
 * Implements pagination with automatic soft delete filtering
 * 
 * @example
 * const result = await paginate(prisma.patient, {
 *   page: 1,
 *   limit: 10,
 *   where: { isActive: true },
 *   orderBy: { name: 'asc' }
 * });
 */
export async function paginate(
  model: any,
  options: {
    page?: number;
    limit?: number;
    where?: any;
    orderBy?: any;
    include?: any;
  }
): Promise<{
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 50, 100); // Max 100 items
  const skip = (page - 1) * limit;

  const where = excludeDeleted(options.where);

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy: options.orderBy,
      include: options.include,
    }),
    model.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Batch Soft Delete
 * 
 * Soft deletes multiple records at once
 * 
 * @example
 * await batchSoftDelete(prisma.patient, ['id1', 'id2', 'id3'], 'user-id');
 */
export async function batchSoftDelete(
  model: any,
  ids: string[],
  userId?: string
): Promise<any> {
  return model.updateMany({
    where: {
      id: { in: ids },
    },
    data: {
      deletedAt: new Date(),
      updatedBy: userId,
    },
  });
}

/**
 * Get Deleted Records
 * 
 * Retrieves only soft-deleted records
 * 
 * @example
 * const deletedPatients = await getDeleted(prisma.patient, {
 *   take: 10,
 *   orderBy: { deletedAt: 'desc' }
 * });
 */
export async function getDeleted(
  model: any,
  args?: any
): Promise<any[]> {
  return model.findMany({
    ...args,
    where: {
      ...args?.where,
      deletedAt: { not: null },
    },
  });
}
