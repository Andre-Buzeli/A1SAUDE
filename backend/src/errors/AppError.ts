/**
 * Base Application Error Class
 * 
 * All custom errors in the application should extend this class.
 * Provides consistent error structure with status codes, error codes, and additional details.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public code: string;
  public readonly details?: any;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    
    // Maintain proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code || this.constructor.name.replace(/([A-Z])/g, '_$1').toUpperCase().substring(1);
    this.details = details;
    this.isOperational = isOperational;
    
    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Convert error to JSON format for API responses
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        details: this.details,
        timestamp: new Date().toISOString()
      }
    };
  }
}
