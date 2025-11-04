import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { createBookingSchema } from '@/lib/validations/bookings';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createBookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { tutorId, date, startTime, endTime, subjectId, notes } = validation.data;

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check tutor exists
    const { data: tutor, error: tutorError } = await supabase
      .from('users')
      .select('*, tutor_profiles(*)')
      .eq('id', tutorId)
      .eq('role', 'TUTOR')
      .single();

    if (tutorError || !tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Check time slot availability
    const { data: conflictingBooking } = await supabase
      .from('bookings')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('date', date)
      .neq('status', 'CANCELLED')
      .or(`start_time.lte.${startTime},end_time.gt.${startTime},start_time.lt.${endTime},end_time.gte.${endTime},start_time.gte.${startTime},end_time.lte.${endTime}`);

    if (conflictingBooking && conflictingBooking.length > 0) {
      return NextResponse.json({ error: 'Time slot is not available' }, { status: 400 });
    }

    // Get the hourly rate for this tutor-subject combination
    const { data: tutorSubject, error: tutorSubjectError } = await supabase
      .from('tutor_subjects')
      .select('*')
      .eq('tutor_id', tutor.tutor_profiles[0]?.id)
      .eq('subject_id', subjectId)
      .single();

    if (tutorSubjectError || !tutorSubject) {
      return NextResponse.json({ error: 'Tutor does not teach this subject' }, { status: 400 });
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        student_id: user.id,
        tutor_id: tutorId,
        subject_id: subjectId,
        date: date,
        start_time: startTime,
        end_time: endTime,
        notes: notes,
        hourly_rate: tutorSubject.hourly_rate,
        status: 'PENDING',
      })
      .select(`
        *,
        tutor:users!bookings_tutor_id_fkey(id, name),
        student:users!bookings_student_id_fkey(id, name)
      `)
      .single();

    if (bookingError) {
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get bookings for this user (as student or tutor)
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        tutor:users!bookings_tutor_id_fkey(id, name),
        student:users!bookings_student_id_fkey(id, name)
      `)
      .or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({ data: bookings });
  } catch (error) {
    console.error('Booking fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}