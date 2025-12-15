/**
 * Custom Error Classes
 * 
 * Centralized error hierarchy for the A1 Saúde application.
 * All errors extend from AppError and provide consistent structure.
 */

// Base Error
export { AppError } from './AppError';

// Validation Errors
export { ValidationError, ValidationErrorDetail } from './ValidationError';

// Authentication & Authorization Errors
export {
  UnauthorizedError,
  ForbiddenError,
  InvalidCredentialsError,
  TokenExpiredError,
  InvalidTokenError
} from './AuthenticationError';

// Resource Errors
export {
  NotFoundError,
  ConflictError,
  DuplicateResourceError,
  GoneError
} from './ResourceError';

// Request Errors
export {
  BadRequestError,
  TooManyRequestsError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
  UnprocessableEntityError
} from './RequestError';

// Service Errors
export {
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
  ExternalServiceError,
  GatewayTimeoutError,
  ConfigurationError
} from './ServiceError';

// Business Logic Errors
export {
  BusinessError,
  InsufficientPermissionsError,
  AccountLockedError,
  InvalidStateError,
  QuotaExceededError,
  DependencyError
} from './BusinessError';
