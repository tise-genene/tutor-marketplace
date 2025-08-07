import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { createReviewSchema, getReviewsSchema } from '@/lib/validations/reviews';
import { validateRequestBody, validateQuery } from '@/lib/validate-request';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { withApiHandler } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  return withApiHandler(async (req) => {
    const validation = validateQuery(req.nextUrl.searchParams, getReviewsSchema);
    if (!validation.success) return validation.error;

    const { tutorId, page, limit } = validation.data;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { tutorId },
        include: {
          student: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { tutorId } })
    ]);

    return apiSuccess(reviews, 200, {
      page, limit, total, pages: Math.ceil(total / limit)
    });
  }, request);
}

export async function POST(request: NextRequest) {
  return withApiHandler(async (req) => {
    const session = await getServerSession(authOptions);
    if (!session) return ApiErrors.UNAUTHORIZED();

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });
    if (!user) return ApiErrors.NOT_FOUND('User');
    if (user.role !== 'STUDENT') return ApiErrors.FORBIDDEN();

    const validation = await validateRequestBody(req, createReviewSchema);
    if (!validation.success) return validation.error;

    const { tutorId, rating, comment, bookingId } = validation.data;

    // Check for existing review
    const existingReview = await prisma.review.findFirst({
      where: { studentId: user.id, tutorId }
    });
    if (existingReview) {
      return ApiErrors.INVALID_INPUT('You have already reviewed this tutor');
    }

    // Verify completed booking if provided
    if (bookingId) {
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          studentId: user.id,
          tutorId,
          status: 'COMPLETED',
        },
      });
      if (!booking) {
        return ApiErrors.INVALID_INPUT('You can only review completed bookings');
      }
    }

    const review = await prisma.review.create({
      data: {
        studentId: user.id,
        tutorId,
        rating,
        comment: comment || null,
      },
      include: {
        student: { select: { id: true, name: true } }
      },
    });

    return apiSuccess(review, 201);
  }, request);
}