import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

interface DashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  totalEarnings?: number;
  averageRating?: number;
}

export async function GET() {
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

    // Get all bookings for the user
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { studentId: user.id },
          { tutorId: user.id },
        ],
      },
      include: {
        reviews: true,
        tutor: {
          include: {
            tutorProfile: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalBookings = bookings.length;
    const upcomingBookings = bookings.filter(
      (booking) =>
        new Date(booking.date) > new Date() &&
        booking.status !== 'CANCELLED'
    ).length;
    const completedBookings = bookings.filter(
      (booking) => booking.status === 'COMPLETED'
    ).length;

    const stats: DashboardStats = {
      totalBookings,
      upcomingBookings,
      completedBookings,
    };

    // Add role-specific statistics
    if (user.role === 'TUTOR') {
      // Calculate total earnings
      const totalEarnings = bookings
        .filter((booking) => booking.status === 'COMPLETED')
        .reduce((sum: number, booking) => {
          const hourlyRate = booking.tutor.tutorProfile?.hourlyRate || 0;
          return sum + hourlyRate;
        }, 0);

      stats.totalEarnings = totalEarnings;
    } else {
      // Calculate average rating for tutors
      const tutorReviews = await prisma.review.findMany({
        where: {
          tutorId: user.id,
        },
      });

      const averageRating =
        tutorReviews.reduce((sum: number, review) => sum + review.rating, 0) /
        (tutorReviews.length || 1);

      stats.averageRating = averageRating;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 