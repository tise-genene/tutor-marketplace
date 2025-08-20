import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Standardized API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Success response helper
export function apiSuccess<T>(
  data: T, 
  status: number = 200,
  pagination?: ApiResponse['pagination']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(pagination && { pagination })
    },
    { status }
  );
}

// Error response helper
export function apiError(
  message: string,
  code: string,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  console.error(`API Error [${code}]: ${message}`, details);
  
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        ...(details && { details })
      }
    },
    { status }
  );
}

// Validation error helper
export function apiValidationError(error: ZodError): NextResponse<ApiResponse> {
  const details = error.issues.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));

  return apiError(
    'Validation failed',
    'VALIDATION_ERROR',
    400,
    details
  );
}

// Common error responses
export const ApiErrors = {
  UNAUTHORIZED: () => apiError('Unauthorized', 'UNAUTHORIZED', 401),
  FORBIDDEN: () => apiError('Forbidden', 'FORBIDDEN', 403),
  NOT_FOUND: (resource: string = 'Resource') => 
    apiError(`${resource} not found`, 'NOT_FOUND', 404),
  INTERNAL_ERROR: () => apiError('Internal server error', 'INTERNAL_ERROR', 500),
  RATE_LIMITED: () => apiError('Rate limit exceeded', 'RATE_LIMITED', 429),
  INVALID_INPUT: (message: string) => 
    apiError(message, 'INVALID_INPUT', 400),
} as const;