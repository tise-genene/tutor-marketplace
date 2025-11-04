import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { createReviewSchema, getReviewsSchema } from '@/lib/validations/reviews';
import { validateRequestBody, validateQuery } from '@/lib/validate-request';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { withApiHandler } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  return withApiHandler(async (req) => {
    const validation = validateQuery(req.nextUrl.searchParams, getReviewsSchema);
    if (!validation.success) return validation.error;

    const { tutorId, page = 1, limit = 10 } = validation.data as any;
    const skip = (page - 1) * limit;

    // Fetch reviews with student info
    const { data: reviews, error: reviewsError, count } = await supabase
      .from('reviews')
      .select(`
        *,
        student:users!reviews_student_id_fkey(id, name)
      `, { count: 'exact' })
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (reviewsError) {
      console.error('Supabase error:', reviewsError);
      return ApiErrors.INTERNAL_ERROR();
    }

    // Transform to match expected format
    const transformedReviews = reviews?.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      student: {
        id: review.student?.id,
        name: review.student?.name,
      },
      tutorId: review.tutor_id,
      studentId: review.student_id,
    })) || [];

    return apiSuccess(transformedReviews, 200, {
      page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit)
    });
  }, request);
}

export async function POST(request: NextRequest) {
  return withApiHandler(async (req) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return ApiErrors.UNAUTHORIZED();

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) return ApiErrors.NOT_FOUND('User');
    if (user.role !== 'STUDENT') return ApiErrors.FORBIDDEN();

    const validation = await validateRequestBody(req, createReviewSchema);
    if (!validation.success) return validation.error;

    const { tutorId, rating, comment, bookingId } = validation.data;

    // Check for existing review
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('student_id', user.id)
      .eq('tutor_id', tutorId)
      .maybeSingle();

    if (existingReview) {
      return ApiErrors.INVALID_INPUT('You have already reviewed this tutor');
    }

    // Verify completed booking if provided
    if (bookingId) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('id', bookingId)
        .eq('student_id', user.id)
        .eq('tutor_id', tutorId)
        .eq('status', 'COMPLETED')
        .maybeSingle();

      if (!booking) {
        return ApiErrors.INVALID_INPUT('You can only review completed bookings');
      }
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        student_id: user.id,
        tutor_id: tutorId,
        rating,
        comment: comment || null,
      })
      .select(`
        *,
        student:users!reviews_student_id_fkey(id, name)
      `)
      .single();

    if (reviewError) {
      console.error('Supabase error:', reviewError);
      return ApiErrors.INTERNAL_ERROR();
    }

    // Transform to match expected format
    const transformedReview = {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      student: {
        id: review.student?.id,
        name: review.student?.name,
      },
      tutorId: review.tutor_id,
      studentId: review.student_id,
    };

    return apiSuccess(transformedReview, 201);
  }, request);
}