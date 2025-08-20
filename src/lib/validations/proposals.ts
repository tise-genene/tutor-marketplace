import { z } from 'zod';

export const createProposalSchema = z.object({
  tutorId: z.string().min(1),
  subjectId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  coverLetter: z.string().max(2000).optional().nullable(),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;


