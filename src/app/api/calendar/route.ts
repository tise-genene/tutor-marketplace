import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { withApiHandler } from '@/lib/api-middleware';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { validateRequestBody } from '@/lib/validate-request';
import { z } from 'zod';

const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  type: z.enum(['SESSION', 'AVAILABILITY', 'REMINDER', 'CUSTOM'] as const),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional().or(z.literal('')),
  subjectId: z.string().optional(),
  bookingId: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
  color: z.string().optional(),
});

const getEventsSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  type: z.enum(['SESSION', 'AVAILABILITY', 'REMINDER', 'CUSTOM'] as const).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function POST(request: NextRequest) {
  return withApiHandler(async (req) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) return ApiErrors.UNAUTHORIZED();

    const body = await validateRequestBody(request, createEventSchema);
    if (!body.success) return body.error;

    const { title, description, startTime, endTime, type, location, meetingUrl, subjectId, bookingId, isRecurring, recurrenceRule, color } = body.data;

    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start >= end) {
      return ApiErrors.INVALID_INPUT('End time must be after start time');
    }

    // Create the calendar event
    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startTime: start,
        endTime: end,
        type,
        location: location || null,
        meetingUrl: meetingUrl || null,
        subjectId: subjectId || null,
        bookingId: bookingId || null,
        isRecurring,
        recurrenceRule: recurrenceRule || null,
        color: color || null,
        // Set tutor or student based on user role
        ...(session.user.role === 'TUTOR' 
          ? { tutorId: session.user.id }
          : { studentId: session.user.id }
        ),
      },
      include: {
        tutor: {
          select: { id: true, name: true, email: true }
        },
        student: {
          select: { id: true, name: true, email: true }
        },
        subject: {
          select: { id: true, name: true, category: true }
        },
        booking: {
          select: { id: true, status: true, hourlyRate: true }
        }
      }
    });

    return apiSuccess(event);
  }, request);
}

export async function GET(request: NextRequest) {
  return withApiHandler(async (req) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) return ApiErrors.UNAUTHORIZED();

    const query = await validateRequestBody(request, getEventsSchema, 'query');
    if (!query.success) return query.error;

    const { start, end, type, status, page, limit } = query.data;
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        { tutorId: session.user.id },
        { studentId: session.user.id }
      ]
    };

    if (start) where.startTime = { gte: new Date(start) };
    if (end) where.endTime = { lte: new Date(end) };
    if (type) where.type = type;
    if (status) where.status = status;

    const [events, total] = await Promise.all([
      prisma.calendarEvent.findMany({
        where,
        include: {
          tutor: {
            select: { id: true, name: true, email: true }
          },
          student: {
            select: { id: true, name: true, email: true }
          },
          subject: {
            select: { id: true, name: true, category: true }
          },
          booking: {
            select: { id: true, status: true, hourlyRate: true }
          }
        },
        orderBy: { startTime: 'asc' },
        skip: offset,
        take: limit,
      }),
      prisma.calendarEvent.count({ where })
    ]);

    return apiSuccess({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }, request);
}
