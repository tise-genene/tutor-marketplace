import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tutors - Get all tutors with search and filter options
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const subject = searchParams.get('subject');
    const minRate = searchParams.get('minRate');
    const maxRate = searchParams.get('maxRate');
    const location = searchParams.get('location');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const where: any = {
      role: 'TUTOR',
      tutorProfile: {
        isNot: null,
      },
    };

    // Add search filters
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tutorProfile: { bio: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (subject) {
      where.tutorProfile.subjects = {
        has: subject,
      };
    }

    if (location) {
      where.tutorProfile.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (minRate || maxRate) {
      where.tutorProfile.hourlyRate = {};
      if (minRate) where.tutorProfile.hourlyRate.gte = parseFloat(minRate);
      if (maxRate) where.tutorProfile.hourlyRate.lte = parseFloat(maxRate);
    }

    // Get tutors with pagination
    const skip = (page - 1) * limit;
    
    const [tutors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          tutorProfile: true,
          tutorReviews: {
            select: {
              rating: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate average ratings
    const tutorsWithRatings = tutors.map((tutor) => {
      const reviews = tutor.tutorReviews;
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;
      
      return {
        ...tutor,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
        tutorReviews: undefined, // Remove to avoid sending sensitive data
      };
    });

    return NextResponse.json({
      tutors: tutorsWithRatings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}