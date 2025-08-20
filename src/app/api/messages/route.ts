import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { withApiHandler } from '@/lib/api-middleware';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { validateRequestBody } from '@/lib/validate-request';
import { z } from 'zod';

const sendMessageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  content: z.string().optional(),
  type: z.enum(['text', 'file', 'voice'] as const).default('text'),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileUrl: z.string().optional(),
  voiceDuration: z.number().optional(),
});

const getMessagesSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});

export async function POST(request: NextRequest) {
  return withApiHandler(async (req) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) return ApiErrors.UNAUTHORIZED();

    const user = await prisma.user.findUnique({ where: { email: session.user.email as string } });
    if (!user) return ApiErrors.NOT_FOUND('User');

    const validation = await validateRequestBody(req, sendMessageSchema);
    if (!validation.success) return validation.error;

    const { receiverId, content, type, fileName, fileType, fileUrl, voiceDuration } = validation.data;

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) return ApiErrors.NOT_FOUND('Receiver');

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content: content || '',
        type,
        fileName,
        fileType,
        fileUrl,
        voiceDuration,
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        message: `You have a new message from ${user.name}`,
        data: { messageId: message.id, senderId: user.id },
      },
    });

    return apiSuccess(message, 201);
  }, request);
}

export async function GET(request: NextRequest) {
  return withApiHandler(async (req) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) return ApiErrors.UNAUTHORIZED();

    const user = await prisma.user.findUnique({ where: { email: session.user.email as string } });
    if (!user) return ApiErrors.NOT_FOUND('User');

    const validation = await validateQuery(req, getMessagesSchema);
    if (!validation.success) return validation.error;

    const { receiverId, page, limit } = validation.data;
    const skip = (page - 1) * limit;

    // Get messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId },
          { senderId: receiverId, receiverId: user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.message.count({
      where: {
        OR: [
          { senderId: user.id, receiverId },
          { senderId: receiverId, receiverId: user.id },
        ],
      },
    });

    return apiSuccess({
      messages: messages.reverse(), // Show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }, request);
}

async function validateQuery(req: NextRequest, schema: z.ZodSchema) {
  try {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const validated = schema.parse(query);
    return { success: true as const, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: ApiErrors.VALIDATION_ERROR(error) };
    }
    return { success: false as const, error: ApiErrors.INTERNAL_ERROR() };
  }
} 