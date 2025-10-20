import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  type: z.enum(['SESSION', 'AVAILABILITY', 'REMINDER', 'CUSTOM']).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  subjectId: z.string().optional(),
  bookingId: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  color: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: event, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', id)
      .or(`tutor_id.eq.${session.user.id},student_id.eq.${session.user.id}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Calendar GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    // Check if user owns this event
    const { data: existingEvent, error: fetchError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', id)
      .or(`tutor_id.eq.${session.user.id},student_id.eq.${session.user.id}`)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 });
    }

    // Validate time range if both times are provided
    if (validatedData.startTime && validatedData.endTime) {
      const start = new Date(validatedData.startTime);
      const end = new Date(validatedData.endTime);
      
      if (start >= end) {
        return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.startTime !== undefined) updateData.start_time = validatedData.startTime;
    if (validatedData.endTime !== undefined) updateData.end_time = validatedData.endTime;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.location !== undefined) updateData.location = validatedData.location;
    if (validatedData.meetingUrl !== undefined) updateData.meeting_url = validatedData.meetingUrl;
    if (validatedData.subjectId !== undefined) updateData.subject_id = validatedData.subjectId;
    if (validatedData.bookingId !== undefined) updateData.booking_id = validatedData.bookingId;
    if (validatedData.isRecurring !== undefined) updateData.is_recurring = validatedData.isRecurring;
    if (validatedData.recurrenceRule !== undefined) updateData.recurrence_rule = validatedData.recurrenceRule;
    if (validatedData.color !== undefined) updateData.color = validatedData.color;

    const { data: updatedEvent, error } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Calendar PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns this event
    const { data: existingEvent, error: fetchError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', id)
      .or(`tutor_id.eq.${session.user.id},student_id.eq.${session.user.id}`)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 });
    }

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Calendar DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
