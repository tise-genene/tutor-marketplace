import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tutor = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: 'TUTOR',
      },
      include: {
        tutorProfile: true,
        reviews: {
          include: {
            student: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!tutor) {
      return NextResponse.json(
        { message: 'Tutor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tutor);
  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 