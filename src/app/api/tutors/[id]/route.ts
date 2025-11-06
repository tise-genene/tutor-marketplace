import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    // Get tutor user with profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        tutor_profiles(
          id,
          bio,
          education,
          experience,
          location,
          availability,
          is_verified,
          rating,
          total_reviews,
          tutor_subjects(
            hourly_rate,
            experience,
            subjects(id, name, category)
          )
        )
      `)
      .eq('id', tutorId)
      .eq('role', 'TUTOR')
      .single();

    if (userError || !user || !user.tutor_profiles || user.tutor_profiles.length === 0) {
      return ApiErrors.NOT_FOUND('Tutor');
    }

    const profile = Array.isArray(user.tutor_profiles) ? user.tutor_profiles[0] : user.tutor_profiles;

    // Get reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        users!reviews_student_id_fkey(id, name)
      `)
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
    }

    // Transform subjects
    const tutorSubjects = profile.tutor_subjects || [];
    const subjectNames = tutorSubjects.map((ts: any) => ts.subjects?.name).filter(Boolean);
    const hourlyRates = tutorSubjects.map((ts: any) => parseFloat(ts.hourly_rate) || 0);
    const avgRate = hourlyRates.length
      ? Math.round((hourlyRates.reduce((a: number, b: number) => a + b, 0) / hourlyRates.length) * 100) / 100
      : 0;

    // Parse education
    let educationString = '';
    try {
      const parsed = typeof profile.education === 'string' 
        ? JSON.parse(profile.education) 
        : profile.education;
      educationString = Array.isArray(parsed) ? parsed.join(', ') : String(parsed ?? '');
    } catch {
      educationString = profile.education ?? '';
    }

    // Parse availability
    const availabilityString = (() => {
      try {
        const a = profile.availability;
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
        isVerified: profile.is_verified,
        rating: parseFloat(profile.rating) || 0,
        totalReviews: profile.total_reviews || 0,
      },
      reviews: (reviews || []).map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment ?? '',
        createdAt: r.created_at,
        student: { 
          name: r.users?.name || 'Unknown' 
        },
      })),
    };

    return apiSuccess(transformed);
  }, request);
}