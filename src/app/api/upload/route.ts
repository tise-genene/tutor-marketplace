import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { withApiHandler } from '@/lib/api-middleware';
import { apiSuccess, ApiErrors } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  return withApiHandler(async (req) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) return ApiErrors.UNAUTHORIZED();

    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return ApiErrors.INVALID_INPUT('No file provided');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return ApiErrors.INVALID_INPUT('File size too large. Maximum 10MB allowed.');
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/ogg',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        return ApiErrors.INVALID_INPUT('File type not allowed');
      }

      // In a production app, you'd upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For now, we'll return a mock URL
      const mockUrl = `https://example.com/uploads/${Date.now()}-${file.name}`;

      return apiSuccess({
        url: mockUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
    } catch (error) {
      console.error('File upload error:', error);
      return ApiErrors.INTERNAL_ERROR();
    }
  }, request);
}
