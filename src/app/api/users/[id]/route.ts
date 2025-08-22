import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { withApiHandler } from '@/lib/api-middleware';
import { apiSuccess, ApiErrors } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const session = await getServerSession(authOptions);
  if (!session?.user) return ApiErrors.UNAUTHORIZED();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      role: true,
      email: true,
    },
  });

  if (!user) return ApiErrors.NOT_FOUND('User');

  return apiSuccess(user);
}
