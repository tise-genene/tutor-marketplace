import { z } from 'zod';

export const searchTutorsSchema = z.object({
  query: z.string().max(100, 'Search query too long').optional(),
  subjectIds: z.string()
    .transform(str => str ? str.split(',').filter(Boolean) : [])
    .optional(),
  minRate: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid minimum rate')
    .transform(Number)
    .optional(),
  maxRate: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid maximum rate')
    .transform(Number)
    .optional(),
  location: z.string().max(50, 'Location too long').optional(),
  minRating: z.string()
    .regex(/^[1-5]$/, 'Rating must be 1-5')
    .transform(Number)
    .optional(),
  verified: z.string()
    .transform(str => str === 'true')
    .optional(),
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .refine(n => n >= 1, 'Page must be at least 1')
    .optional(),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n >= 1 && n <= 50, 'Limit must be between 1 and 50')
    .optional(),
  sortBy: z.union([
    z.literal('rating'),
    z.literal('price_asc'),
    z.literal('price_desc'),
    z.literal('newest'),
  ]).optional()
});

export type SearchTutorsQuery = z.infer<typeof searchTutorsSchema>;