import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: any
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      );
    }

    // Get the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        student:users!bookings_student_id_fkey(id, name, email),
        tutor:users!bookings_tutor_id_fkey(id, name, email)
      `)
      .eq('id', params.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if the user is authorized to update the booking
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user?.email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (
      user.role === 'STUDENT' &&
      booking.student_id !== user.id
    ) {
      return NextResponse.json(
        { message: 'Unauthorized to update this booking' },
        { status: 403 }
      );
    }

    if (
      user.role === 'TUTOR' &&
      booking.tutor_id !== user.id
    ) {
      return NextResponse.json(
        { message: 'Unauthorized to update this booking' },
        { status: 403 }
      );
    }

    // Update the booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', params.id)
      .select(`
        *,
        student:users!bookings_student_id_fkey(id, name, email),
        tutor:users!bookings_tutor_id_fkey(id, name, email)
      `)
      .single();

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 