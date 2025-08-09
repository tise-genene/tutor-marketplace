import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { createBookingSchema } from '@/lib/validations/bookings';
import { validateRequestBody } from '@/lib/validate-request';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { withApiHandler } from '@/lib/api-middleware';

export async function POST(request: NextRequest) {
  return withApiHandler(async (req) => {
    const session = await getServerSession(authOptions);
    if (!session) return ApiErrors.UNAUTHORIZED();

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });
    if (!user) return ApiErrors.NOT_FOUND('User');
    if (user.role !== 'STUDENT') return ApiErrors.FORBIDDEN();

    const validation = await validateRequestBody(req, createBookingSchema);
    if (!validation.success) return validation.error;

    const { tutorId, date, startTime, endTime, subjectId, notes } = validation.data;

    // Check tutor exists
    const tutor = await prisma.user.findUnique({
      where: { id: tutorId, role: 'TUTOR' },
      include: { tutorProfile: true },
    });
    if (!tutor) return ApiErrors.NOT_FOUND('Tutor');

    // Check time slot availability
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        tutorId,
        date: new Date(date),
        status: { not: 'CANCELLED' },
        OR: [
          { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
          { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
          { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
        ],
      },
    });

    if (conflictingBooking) {
      return ApiErrors.INVALID_INPUT('Time slot is not available');
    }

    // Get the hourly rate for this tutor-subject combination
    const tutorSubject = await prisma.tutorSubject.findUnique({
      where: {
        tutorId_subjectId: {
          tutorId: tutor.tutorProfile!.id,
          subjectId,
        },
      },
    });

    if (!tutorSubject) {
      return ApiErrors.INVALID_INPUT('Tutor does not teach this subject');
    }

    const booking = await prisma.booking.create({
      data: {
        studentId: user.id,
        tutorId,
        subjectId,
        date: new Date(date),
        startTime,
        endTime,
        notes,
        hourlyRate: tutorSubject.hourlyRate,
        status: 'PENDING',
      },
      include: {
        tutor: { select: { id: true, name: true } },
        student: { select: { id: true, name: true } },
      },
    });

    return apiSuccess(booking, 201);
  }, request);
}

export async function GET(request: NextRequest) {
  return withApiHandler(async (req) => {
    const session = await getServerSession(authOptions);
    if (!session) return ApiErrors.UNAUTHORIZED();

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });
    if (!user) return ApiErrors.NOT_FOUND('User');

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { studentId: user.id },
          { tutorId: user.id },
        ],
      },
      include: {
        tutor: { select: { id: true, name: true } },
        student: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(bookings);
  }, request);
}