# SQLite Limitations and Workarounds

## Issue

SQLite does not support:
1. Native `Json` type
2. Native `enum` types
3. `@db.Date` type

## Solution

For SQLite (development), we need to:
1. Keep JSON fields as `String` with JSON content
2. Keep enums as `String` with validation in application code
3. Use `DateTime` without `@db.Date`

## Recommendation

**For production with PostgreSQL**, the optimized schema with native Json and enums WILL work and provide all the benefits.

## Two-Schema Approach

### Option 1: Keep Current Schema for SQLite

Keep the current `schema_old.prisma` for development (SQLite) and use the optimized schema only for PostgreSQL production.

### Option 2: Conditional Schema

Use Prisma's multi-file schema feature or environment-based schema selection.

### Option 3: Implement Optimizations at Application Level

Since SQLite doesn't support these features natively, implement them in the application:

1. **Soft Delete**: Add `deletedAt` field (works in SQLite)
2. **Audit Fields**: Add `createdBy`/`updatedBy` (works in SQLite)
3. **Indexes**: Add performance indexes (works in SQLite)
4. **JSON Validation**: Validate JSON in application code before saving
5. **Enum Validation**: Use Zod schemas to validate enum values

## Implemented Changes for SQLite

The following changes CAN be applied to SQLite:

### ✅ Soft Delete
```prisma
model Patient {
  // ... other fields
  deletedAt DateTime?
  
  @@index([deletedAt])
}
```

### ✅ Audit Fields
```prisma
model Patient {
  // ... other fields
  createdBy String?
  updatedBy String?
}
```

### ✅ Performance Indexes
```prisma
model Attendance {
  // ... other fields
  
  @@index([patientId, startTime])
  @@index([professionalId, startTime])
  @@index([establishmentId, status])
}
```

### ❌ Native JSON (Keep as String)
```prisma
model Patient {
  allergies String // JSON string - validate in app
}
```

### ❌ Native Enums (Keep as String)
```prisma
model Attendance {
  type   String // Validate with Zod in app
  status String // Validate with Zod in app
}
```

## Migration Strategy

1. **Development (SQLite)**: Apply soft delete, audit fields, and indexes only
2. **Production (PostgreSQL)**: Use full optimized schema with Json and enums
3. **Application Code**: Implement validation for both environments

## Next Steps

Create a SQLite-compatible optimized schema that includes:
- ✅ Soft delete (`deletedAt`)
- ✅ Audit fields (`createdBy`, `updatedBy`)
- ✅ Performance indexes
- ❌ Keep JSON as String (with app-level validation)
- ❌ Keep enums as String (with app-level validation)
