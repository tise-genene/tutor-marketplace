import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { searchTutorsSchema } from '@/lib/validations/search';
import { validateQuery } from '@/lib/validate-request';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { withApiHandler } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  return withApiHandler(async (req) => {
    const validation = validateQuery(req.nextUrl.searchParams, searchTutorsSchema);
    if (!validation.success) return validation.error;

    const { 
      query, subjectIds, minRate, maxRate, location, 
      minRating, verified, page = 1, limit = 12, sortBy 
    } = validation.data as any;

    const skip = (page - 1) * limit;
    
    // Build base query for tutors
    let tutorsQuery = supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        created_at,
        tutor_profiles!inner(
          id,
          bio,
          location,
          rating,
          total_reviews,
          is_verified,
          availability,
          tutor_subjects(
            hourly_rate,
            experience,
            subjects(id, name, category)
          )
        )
      `)
      .eq('role', 'TUTOR');

    // Apply filters
    if (query) {
      tutorsQuery = tutorsQuery.or(`name.ilike.%${query}%,tutor_profiles.bio.ilike.%${query}%`);
    }

    if (location) {
      tutorsQuery = tutorsQuery.ilike('tutor_profiles.location', `%${location}%`);
    }

    if (minRating) {
      tutorsQuery = tutorsQuery.gte('tutor_profiles.rating', minRating);
    }

    if (verified !== undefined) {
      tutorsQuery = tutorsQuery.eq('tutor_profiles.is_verified', verified);
    }

    // Subject and rate filtering
    if (subjectIds && subjectIds.length > 0) {
      tutorsQuery = tutorsQuery.in('tutor_profiles.tutor_subjects.subject_id', subjectIds);
      
      if (minRate || maxRate) {
        if (minRate) {
          tutorsQuery = tutorsQuery.gte('tutor_profiles.tutor_subjects.hourly_rate', minRate);
        }
        if (maxRate) {
          tutorsQuery = tutorsQuery.lte('tutor_profiles.tutor_subjects.hourly_rate', maxRate);
        }
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        tutorsQuery = tutorsQuery.order('tutor_profiles.rating', { ascending: false });
        break;
      case 'newest':
        tutorsQuery = tutorsQuery.order('created_at', { ascending: false });
        break;
      default:
        tutorsQuery = tutorsQuery.order('tutor_profiles.rating', { ascending: false });
    }

    // Get tutors with count
    const { data: tutors, error: tutorsError, count } = await tutorsQuery
      .range(skip, skip + limit - 1);

    if (tutorsError) {
      console.error('Error fetching tutors:', tutorsError);
      return ApiErrors.INTERNAL_ERROR();
    }

    // Get all subjects for filter dropdowns
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name, category')
      .order('name', { ascending: true });

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
    }

    // Transform response
    const transformedTutors = (tutors || []).map((tutor: any) => {
      const profile = tutor.tutor_profiles?.[0];
      if (!profile) return null;

      const tutorSubjects = profile.tutor_subjects || [];
      const subjects = tutorSubjects.map((ts: any) => ({
        id: ts.subjects?.id,
        name: ts.subjects?.name,
        category: ts.subjects?.category,
        hourlyRate: parseFloat(ts.hourly_rate) || 0,
        experience: ts.experience || 0,
      })).filter((s: any) => s.id);

      const avgRate = subjects.length > 0 
        ? subjects.reduce((sum: number, s: any) => sum + s.hourlyRate, 0) / subjects.length
        : 0;

      return {
        id: tutor.id,
        name: tutor.name,
        bio: profile.bio,
        location: profile.location,
        rating: parseFloat(profile.rating) || 0,
        totalReviews: profile.total_reviews || 0,
        isVerified: profile.is_verified || false,
        subjects,
        averageRate: Math.round(avgRate * 100) / 100,
        availability: profile.availability,
        createdAt: tutor.created_at,
      };
    }).filter(Boolean);

    return apiSuccess({
      tutors: transformedTutors,
      subjects: subjects || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  }, request);
}

// Get all subjects for filter dropdowns
export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        category,
        tutor_subjects(count)
      `)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching subjects:', error);
      return ApiErrors.INTERNAL_ERROR();
    }

    const categorized = (subjects || []).reduce((acc: Record<string, any[]>, subject: any) => {
      if (!acc[subject.category]) acc[subject.category] = [];
      acc[subject.category].push({
        id: subject.id,
        name: subject.name,
        tutorCount: subject.tutor_subjects?.[0]?.count || 0,
      });
      return acc;
    }, {});

    return apiSuccess({ subjects: categorized });
  }, request);
}