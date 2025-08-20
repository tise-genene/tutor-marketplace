import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { withApiHandler } from '@/lib/api-middleware';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { validateRequestBody } from '@/lib/validate-request';
import { z } from 'zod';

const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  startTime: z.string().datetime('Invalid start time').optional(),
  endTime: z.string().datetime('Invalid end time').optional(),
  type: z.enum(['SESSION', 'AVAILABILITY', 'REMINDER', 'CUSTOM'] as const).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const).optional(),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional().or(z.literal('')),
  color: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler(async (req) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) return ApiErrors.UNAUTHORIZED();

    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: params.id,
        OR: [
          { tutorId: session.user.id },
          { studentId: session.user.id }
        ]
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

    if (!event) return ApiErrors.NOT_FOUND('Calendar event');

    return apiSuccess(event);
  }, request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler(async (req) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) return ApiErrors.UNAUTHORIZED();

    // Check if user owns this event
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: params.id,
        OR: [
          { tutorId: session.user.id },
          { studentId: session.user.id }
        ]
      }
    });

    if (!existingEvent) return ApiErrors.NOT_FOUND('Calendar event');

    const body = await validateRequestBody(request, updateEventSchema);
    if (!body.success) return body.error;

    const updateData: any = { ...body.data };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Validate time range if both times are provided
    if (updateData.startTime && updateData.endTime) {
      const start = new Date(updateData.startTime);
      const end = new Date(updateData.endTime);
      
      if (start >= end) {
        return ApiErrors.INVALID_INPUT('End time must be after start time');
      }
    }

    const event = await prisma.calendarEvent.update({
      where: { id: params.id },
      data: updateData,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiHandler(async (req) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) return ApiErrors.UNAUTHORIZED();

    // Check if user owns this event
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: params.id,
        OR: [
          { tutorId: session.user.id },
          { studentId: session.user.id }
        ]
      }
    });

    if (!existingEvent) return ApiErrors.NOT_FOUND('Calendar event');

    await prisma.calendarEvent.delete({
      where: { id: params.id }
    });

    return apiSuccess({ message: 'Event deleted successfully' });
  }, request);
}
