import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/reviews - Get all reviews for a tutor
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');

    if (!tutorId) {
      return NextResponse.json(
        { message: 'Tutor ID is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        tutorId: tutorId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { tutorId, rating, comment, bookingId } = body;

    // Validate input
    if (!tutorId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Invalid input. Tutor ID and rating (1-5) are required.' },
        { status: 400 }
      );
    }

    // Check if user is a student and has completed booking with this tutor
    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'Only students can leave reviews' },
        { status: 403 }
      );
    }

    // Verify the booking exists and is completed
    if (bookingId) {
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          studentId: user.id,
          tutorId: tutorId,
          status: 'COMPLETED',
        },
      });

      if (!booking) {
        return NextResponse.json(
          { message: 'You can only review completed bookings' },
          { status: 400 }
        );
      }

      // Check if review already exists for this booking
      const existingReview = await prisma.review.findFirst({
        where: {
          studentId: user.id,
          tutorId: tutorId,
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { message: 'You have already reviewed this tutor' },
          { status: 400 }
        );
      }
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        studentId: user.id,
        tutorId: tutorId,
        rating: parseInt(rating),
        comment: comment || null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}