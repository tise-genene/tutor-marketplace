import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchTutorsSchema } from '@/lib/validations/search';
import { validateQuery } from '@/lib/validate-request';
import { apiSuccess } from '@/lib/api-response';
import { withApiHandler } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  return withApiHandler(async (req) => {
    const validation = validateQuery(req.nextUrl.searchParams, searchTutorsSchema);
    if (!validation.success) return validation.error;

    const { 
      query, subjectIds, minRate, maxRate, location, 
      minRating, verified, page, limit, sortBy 
    } = validation.data;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {
      role: 'TUTOR',
      tutorProfile: { isNot: null },
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { tutorProfile: { bio: { contains: query, mode: 'insensitive' } } },
      ];
    }

    if (location) {
      where.tutorProfile.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (minRating) {
      where.tutorProfile.rating = { gte: minRating };
    }

    if (verified !== undefined) {
      where.tutorProfile.isVerified = verified;
    }

    // Subject filtering with rate filtering
    if (subjectIds && subjectIds.length > 0) {
      const subjectWhere: any = {
        subjectId: { in: subjectIds },
      };
      
      if (minRate || maxRate) {
        if (minRate) subjectWhere.hourlyRate = { gte: minRate };
        if (maxRate) {
          subjectWhere.hourlyRate = subjectWhere.hourlyRate 
            ? { ...subjectWhere.hourlyRate, lte: maxRate }
            : { lte: maxRate };
        }
      }

      where.tutorProfile.subjects = {
        some: subjectWhere,
      };
    }

    // Build orderBy
    const orderBy: any = (() => {
      switch (sortBy) {
        case 'rating': return { tutorProfile: { rating: 'desc' } };
        case 'price_asc': return { tutorProfile: { subjects: { _count: 'asc' } } }; // Fallback
        case 'price_desc': return { tutorProfile: { subjects: { _count: 'desc' } } }; // Fallback
        case 'newest': return { createdAt: 'desc' };
        default: return { tutorProfile: { rating: 'desc' } };
      }
    })();

    // Execute queries in parallel
    const [tutors, total, subjects] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          tutorProfile: {
            include: {
              subjects: {
                include: { subject: true },
                ...(minRate || maxRate ? {
                  where: {
                    ...(minRate && { hourlyRate: { gte: minRate } }),
                    ...(maxRate && { hourlyRate: { lte: maxRate } }),
                  }
                } : {})
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.user.count({ where }),
      prisma.subject.findMany({
        select: { id: true, name: true, category: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Transform response
    const transformedTutors = tutors.map((tutor) => {
      const profile = tutor.tutorProfile!;
      
      // Calculate average rate and subjects
      const subjects = profile.subjects.map(ts => ({
        id: ts.subject.id,
        name: ts.subject.name,
        category: ts.subject.category,
        hourlyRate: ts.hourlyRate,
        experience: ts.experience,
      }));

      const avgRate = subjects.length > 0 
        ? subjects.reduce((sum, s) => sum + s.hourlyRate, 0) / subjects.length
        : 0;

      return {
        id: tutor.id,
        name: tutor.name,
        bio: profile.bio,
        location: profile.location,
        rating: profile.rating,
        totalReviews: profile.totalReviews,
        isVerified: profile.isVerified,
        subjects,
        averageRate: Math.round(avgRate * 100) / 100,
        availability: profile.availability,
        createdAt: tutor.createdAt,
      };
    });

    return apiSuccess({
      tutors: transformedTutors,
      subjects, // For filter options
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }, request);
}

// Get all subjects for filter dropdowns
export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: { tutorSubjects: true },
        },
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    const categorized = subjects.reduce((acc, subject) => {
      if (!acc[subject.category]) acc[subject.category] = [];
      acc[subject.category].push({
        id: subject.id,
        name: subject.name,
        tutorCount: subject._count.tutorSubjects,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return apiSuccess({ subjects: categorized });
  }, request);
}