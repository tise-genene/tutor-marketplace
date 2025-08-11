import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { withApiHandler } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const tutorId = segments[segments.length - 1];

    if (!tutorId) {
      return ApiErrors.INVALID_INPUT('Tutor ID is required');
    }

    const user = await prisma.user.findUnique({
      where: { id: tutorId },
      include: {
        tutorProfile: {
          include: {
            subjects: { include: { subject: true } },
          },
        },
        tutorReviews: {
          include: { student: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user || user.role !== 'TUTOR' || !user.tutorProfile) {
      return ApiErrors.NOT_FOUND('Tutor');
    }

    const profile = user.tutorProfile;

    const subjectNames = profile.subjects.map((ts) => ts.subject.name);
    const hourlyRates = profile.subjects.map((ts) => ts.hourlyRate);
    const avgRate = hourlyRates.length
      ? Math.round((hourlyRates.reduce((a, b) => a + b, 0) / hourlyRates.length) * 100) / 100
      : 0;

    let educationString = '';
    try {
      const parsed = JSON.parse(profile.education || '[]');
      educationString = Array.isArray(parsed) ? parsed.join(', ') : String(parsed ?? '');
    } catch {
      educationString = profile.education ?? '';
    }

    const availabilityString = (() => {
      try {
        const a = profile.availability as unknown as any;
        return typeof a === 'string' ? a : JSON.stringify(a);
      } catch {
        return '';
      }
    })();

    const transformed = {
      id: user.id,
      name: user.name,
      email: user.email,
      tutorProfile: {
        bio: profile.bio ?? '',
        subjects: subjectNames,
        education: educationString,
        experience: String(profile.experience ?? ''),
        hourlyRate: avgRate,
        location: profile.location,
        availability: availabilityString,
        isVerified: profile.isVerified,
        rating: profile.rating,
        totalReviews: profile.totalReviews,
      },
      reviews: user.tutorReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment ?? '',
        createdAt: r.createdAt.toISOString(),
        student: { name: r.student.name },
      })),
    };

    return apiSuccess(transformed);
  }, request);
}