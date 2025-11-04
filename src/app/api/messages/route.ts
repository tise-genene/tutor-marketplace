import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const getMessagesSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const validatedData = getMessagesSchema.parse({
      receiverId: searchParams.get('receiverId'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    const { data: messages, error, count } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${validatedData.receiverId}),and(sender_id.eq.${validatedData.receiverId},receiver_id.eq.${session.user.id})`)
      .order('created_at', { ascending: false })
      .range(validatedData.offset, validatedData.offset + validatedData.limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({
      messages: messages?.reverse() || [],
      pagination: {
        limit: validatedData.limit,
        offset: validatedData.offset,
        total: count || 0,
        hasMore: (count || 0) > validatedData.offset + validatedData.limit,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  receiverId: z.string().min(1, 'Receiver ID is required'),
  type: z.enum(['TEXT', 'FILE', 'VOICE']).default('TEXT'),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileUrl: z.string().url().optional(),
  voiceDuration: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);

    // Verify receiver exists
    const { data: receiver, error: receiverError } = await supabase
      .from('users')
      .select('id')
      .eq('id', validatedData.receiverId)
      .single();

    if (receiverError || !receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    const messageData = {
      content: validatedData.content,
      sender_id: session.user.id,
      receiver_id: validatedData.receiverId,
      type: validatedData.type,
      file_name: validatedData.fileName,
      file_type: validatedData.fileType,
      file_url: validatedData.fileUrl,
      voice_duration: validatedData.voiceDuration,
      read: false,
    };

    const { data: message, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 