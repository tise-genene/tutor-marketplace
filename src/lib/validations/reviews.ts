import { z } from 'zod';

// Create review validation
export const createReviewSchema = z.object({
  tutorId: z.string()
    .min(1, 'Tutor ID is required')
    .cuid('Invalid tutor ID format'),
  
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .int('Rating must be a whole number'),
  
  comment: z.string()
    .max(1000, 'Comment must be less than 1000 characters')
    .optional(),
  
  bookingId: z.string()
    .cuid('Invalid booking ID format')
    .optional()
});

// Get reviews query validation
export const getReviewsSchema = z.object({
  tutorId: z.string()
    .min(1, 'Tutor ID is required')
    .cuid('Invalid tutor ID format'),
  
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .refine(n => n >= 1, 'Page must be at least 1')
    .optional(),
  
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n >= 1 && n <= 50, 'Limit must be between 1 and 50')
    .optional()
});

// Types
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type GetReviewsQuery = z.infer<typeof getReviewsSchema>;