import { z } from 'zod';

// Create booking validation
export const createBookingSchema = z.object({
  tutorId: z.string()
    .min(1, 'Tutor ID is required')
    .cuid('Invalid tutor ID format'),
  
  date: z.string()
    .min(1, 'Date is required')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const now = new Date();
      return date > now;
    }, 'Booking date must be in the future'),
  
  startTime: z.string()
    .min(1, 'Start time is required')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'),
  
  endTime: z.string()
    .min(1, 'End time is required')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'),
  
  subjectId: z.string()
    .min(1, 'Subject is required')
    .cuid('Invalid subject ID format'),
  
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
}).refine((data) => {
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return endMinutes > startMinutes;
}, {
  message: 'End time must be after start time',
  path: ['endTime']
});

// Update booking status validation
export const updateBookingSchema = z.object({
  status: z.union([
    z.literal('PENDING'),
    z.literal('CONFIRMED'),
    z.literal('CANCELLED'),
    z.literal('COMPLETED'),
  ]),
});

// Types
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;