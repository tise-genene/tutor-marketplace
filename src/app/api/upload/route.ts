import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const uploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  bucket: z.enum(['avatars', 'documents', 'voice-messages']),
  audioBlob: z.string().optional(), // Base64 encoded audio for voice messages
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = uploadSchema.parse(body);

    let fileBuffer: Buffer;
    let contentType: string;

    if (validatedData.audioBlob) {
      // Handle audio blob (base64)
      const base64Data = validatedData.audioBlob.replace(/^data:audio\/wav;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
      contentType = 'audio/wav';
    } else {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 });
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(validatedData.bucket)
      .upload(`${session.user.id}/${validatedData.fileName}`, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(validatedData.bucket)
      .getPublicUrl(data.path);

    return NextResponse.json({
      data: {
        path: data.path,
        url: urlData.publicUrl,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
