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
    
    // Start with tutor_profiles as the main table (not users)
    let tutorsQuery = supabase
      .from('tutor_profiles')
      .select(`
        id,
        bio,
        location,
        rating,
        total_reviews,
        is_verified,
        availability,
        created_at,
        users!inner(
          id,
          name,
          email,
          created_at
        ),
        tutor_subjects(
          hourly_rate,
          experience,
          subjects(id, name, category)
        )
      `)
      .eq('users.role', 'TUTOR');

    // Apply filters on tutor_profiles (main table)
    if (query) {
      tutorsQuery = tutorsQuery.or(`bio.ilike.%${query}%,users.name.ilike.%${query}%`);
    }

    if (location) {
      tutorsQuery = tutorsQuery.ilike('location', `%${location}%`);
    }

    if (minRating) {
      tutorsQuery = tutorsQuery.gte('rating', minRating);
    }

    if (verified !== undefined) {
      tutorsQuery = tutorsQuery.eq('is_verified', verified);
    }

    // Apply sorting on main table columns
    switch (sortBy) {
      case 'rating':
        tutorsQuery = tutorsQuery.order('rating', { ascending: false });
        break;
      case 'newest':
        tutorsQuery = tutorsQuery.order('created_at', { ascending: false });
        break;
      default:
        tutorsQuery = tutorsQuery.order('rating', { ascending: false });
    }

    // Get tutors with count
    const { data: tutors, error: tutorsError, count } = await tutorsQuery
      .range(skip, skip + limit - 1);

    if (tutorsError) {
      console.error('Error fetching tutors:', tutorsError);
      return ApiErrors.INTERNAL_ERROR();
    }

    // Filter by subject IDs and rates in memory (since Supabase doesn't support nested filtering)
    let filteredTutors = tutors || [];
    
    if (subjectIds && subjectIds.length > 0) {
      filteredTutors = filteredTutors.filter((tutor: any) => {
        const tutorSubjects = tutor.tutor_subjects || [];
        const hasMatchingSubject = tutorSubjects.some((ts: any) => {
          const subjectId = ts.subjects?.id;
          if (!subjectIds.includes(subjectId)) return false;
          
          // Check rate filters if provided
          const rate = parseFloat(ts.hourly_rate) || 0;
          if (minRate && rate < minRate) return false;
          if (maxRate && rate > maxRate) return false;
          
          return true;
        });
        return hasMatchingSubject;
      });
    } else if (minRate || maxRate) {
      // If no subject filter but rate filter, check average rate
      filteredTutors = filteredTutors.filter((tutor: any) => {
        const tutorSubjects = tutor.tutor_subjects || [];
        if (tutorSubjects.length === 0) return false;
        
        const avgRate = tutorSubjects.reduce((sum: number, ts: any) => {
          return sum + (parseFloat(ts.hourly_rate) || 0);
        }, 0) / tutorSubjects.length;
        
        if (minRate && avgRate < minRate) return false;
        if (maxRate && avgRate > maxRate) return false;
        
        return true;
      });
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
    const transformedTutors = filteredTutors.map((tutor: any) => {
      const user = Array.isArray(tutor.users) ? tutor.users[0] : tutor.users;
      if (!user) return null;

      const tutorSubjects = tutor.tutor_subjects || [];
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
        id: user.id,
        name: user.name,
        bio: tutor.bio,
        location: tutor.location,
        rating: parseFloat(tutor.rating) || 0,
        totalReviews: tutor.total_reviews || 0,
        isVerified: tutor.is_verified || false,
        subjects,
        averageRate: Math.round(avgRate * 100) / 100,
        availability: tutor.availability,
        createdAt: user.created_at,
      };
    }).filter(Boolean);

    return apiSuccess({
      tutors: transformedTutors,
      subjects: subjects || [],
      pagination: {
        page,
        limit,
        total: filteredTutors.length, // Use filtered count
        pages: Math.ceil(filteredTutors.length / limit),
      },
    });
  }, request);
}

// Get all subjects for filter dropdowns
export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    // Use a separate query to count tutors per subject
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name, category')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
      return ApiErrors.INTERNAL_ERROR();
    }

    // Get tutor counts per subject
    const { data: tutorSubjects, error: tutorSubjectsError } = await supabase
      .from('tutor_subjects')
      .select('subject_id');

    const tutorCounts: Record<string, number> = {};
    if (!tutorSubjectsError && tutorSubjects) {
      tutorSubjects.forEach((ts: any) => {
        tutorCounts[ts.subject_id] = (tutorCounts[ts.subject_id] || 0) + 1;
      });
    }

    const categorized = (subjects || []).reduce((acc: Record<string, any[]>, subject: any) => {
      if (!acc[subject.category]) acc[subject.category] = [];
      acc[subject.category].push({
        id: subject.id,
        name: subject.name,
        tutorCount: tutorCounts[subject.id] || 0,
      });
      return acc;
    }, {});

    return apiSuccess({ subjects: categorized });
  }, request);
}