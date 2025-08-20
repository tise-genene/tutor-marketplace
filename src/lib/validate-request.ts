import { NextRequest } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { apiValidationError, apiError } from './api-response';

// Validate request body
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: any }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: apiValidationError(error) };
    }
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: apiError(
          'Invalid JSON format',
          'VALIDATION_ERROR',
          400,
          [{ field: '', message: 'Invalid JSON format' }]
        ),
      };
    }
    throw error; // Re-throw unexpected errors
  }
}

// Validate query parameters
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: any } {
  try {
    // Convert URLSearchParams to object
    const queryObject: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryObject[key] = value;
    });
    
    const validatedData = schema.parse(queryObject);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: apiValidationError(error) };
    }
    throw error;
  }
}

// Auth helper - extract user from session
export async function getAuthenticatedUser(request: NextRequest) {
  // This will be implemented when we fix auth
  // For now, return null to maintain existing behavior
  return null;
}