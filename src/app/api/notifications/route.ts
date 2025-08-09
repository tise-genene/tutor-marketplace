import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

// Map persisted booking-style enums to proposal-style enums for client display
const bookingToProposalType: Record<string, string> = {
  BOOKING_REQUEST: 'PROPOSAL_SUBMITTED',
  BOOKING_CONFIRMED: 'PROPOSAL_CONFIRMED',
  BOOKING_CANCELLED: 'PROPOSAL_CANCELLED',
};

// Accept proposal-style enums and normalize to persisted booking-style enums
const proposalToBookingType: Record<string, string> = {
  PROPOSAL_SUBMITTED: 'BOOKING_REQUEST',
  PROPOSAL_CONFIRMED: 'BOOKING_CONFIRMED',
  PROPOSAL_CANCELLED: 'BOOKING_CANCELLED',
};

function replaceBookingCopy(message: string): string {
  // Replace 'booking'/'bookings' with 'proposal'/'proposals' (case-insensitive, word-boundary)
  return message.replace(/\bbooking(s)?\b/gi, (_match, plural) => `proposal${plural ? 's' : ''}`);
}

// GET /api/notifications - Get user notifications
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

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { userId: user.id };
    if (unreadOnly) {
      where.read = false;
    }

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: user.id,
          read: false,
        },
      }),
    ]);

    // Transform types/messages for client without changing persisted values
    const transformed = notifications.map((n) => ({
      ...n,
      type: bookingToProposalType[n.type as string] || n.type,
      message: replaceBookingCopy(n.message),
    }));

    return NextResponse.json({
      notifications: transformed,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a notification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, message, relatedId } = body;

    if (!userId || !type || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Normalize proposal-style enum to booking-style enum for persistence
    const normalizedType = proposalToBookingType[type] || type;

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: normalizedType as any,
        message,
        relatedId: relatedId || null,
      },
    });

    // Return transformed response for client
    const clientNotification = {
      ...notification,
      type: bookingToProposalType[notification.type as unknown as string] || (notification.type as any),
      message: replaceBookingCopy(notification.message),
    };

    return NextResponse.json(clientNotification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: Request) {
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

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read for the user
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.id,
        },
        data: {
          read: true,
        },
      });
    } else {
      return NextResponse.json(
        { message: 'Invalid request. Provide notificationIds or set markAllAsRead to true.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}