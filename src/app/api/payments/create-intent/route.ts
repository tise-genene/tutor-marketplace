import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createPaymentIntent } from '@/lib/stripe';
import { validateRequestBody } from '@/lib/validate-request';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { apiSuccess, ApiErrors } from '@/lib/api-response';

const createPaymentIntentSchema = z.object({
  proposalId: z.string().min(1, 'Proposal ID is required'),
  amount: z.number().positive('Amount must be positive'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
      return ApiErrors.UNAUTHORIZED();
    }

    const validation = await validateRequestBody(req, createPaymentIntentSchema);
    if (!validation.success) {
      return validation.error;
    }
    
    const body = validation.data;
    
    // Get proposal (booking) details from Supabase
    const { data: proposal, error: proposalError } = await supabase
      .from('bookings')
      .select(`
        *,
        student:users!bookings_student_id_fkey(id, name),
        tutor:users!bookings_tutor_id_fkey(id, name),
        subjects(id, name)
      `)
      .eq('id', body.proposalId)
      .single();

    if (proposalError || !proposal) {
      return ApiErrors.NOT_FOUND('Proposal');
    }

    // Verify the user is the student who created the proposal
    if (proposal.student_id !== session.user.id) {
      return ApiErrors.UNAUTHORIZED();
    }

    // Calculate duration from start and end times
    const startTime = new Date(`2000-01-01T${proposal.start_time}`);
    const endTime = new Date(`2000-01-01T${proposal.end_time}`);
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    // Create payment intent
    const paymentIntent = await createPaymentIntent(body.amount, {
      proposalId: body.proposalId,
      studentId: session.user.id,
      tutorId: proposal.tutor_id,
      subject: proposal.subjects?.name || 'Tutoring Session',
      hours: durationHours,
    });

    return apiSuccess({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return ApiErrors.INTERNAL_ERROR();
  }
}
