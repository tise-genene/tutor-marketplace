import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tutorId, date, startTime, endTime, subject } = await request.json();

    // Validate required fields
    if (!tutorId || !date || !startTime || !endTime || !subject) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the user is a student
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'Only students can create bookings' },
        { status: 403 }
      );
    }

    // Check if the tutor exists
    const tutor = await prisma.user.findUnique({
      where: { id: tutorId },
      include: { tutorProfile: true },
    });

    if (!tutor || tutor.role !== 'TUTOR') {
      return NextResponse.json(
        { message: 'Invalid tutor' },
        { status: 400 }
      );
    }

    // Check if the time slot is available
    const existingBooking = await prisma.booking.findFirst({
      where: {
        tutorId,
        date: new Date(date),
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
        status: {
          notIn: ['CANCELLED'],
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { message: 'This time slot is already booked' },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        studentId: user.id,
        tutorId,
        date: new Date(date),
        startTime,
        endTime,
        subject,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      { message: 'Booking created successfully', booking },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get bookings based on user role
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { studentId: user.id },
          { tutorId: user.id },
        ],
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 