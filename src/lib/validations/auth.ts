import { z } from 'zod';

// User registration validation
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-'\.]+$/, 'Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods'),
  
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  
  role: z.enum(['STUDENT', 'TUTOR'] as const)
});

// Login validation
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  password: z.string()
    .min(1, 'Password is required')
    .max(100, 'Password must be less than 100 characters')
});

// Types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;