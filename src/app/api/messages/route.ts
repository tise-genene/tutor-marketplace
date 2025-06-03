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

    const { content, receiverId } = await request.json();

    if (!content || !receiverId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the sender
    const sender = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });

    if (!sender) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get the receiver
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { message: 'Receiver not found' },
        { status: 404 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: sender.id,
        receiverId: receiver.id,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Message creation error:', error);
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

    const { searchParams } = new URL(request.url);
    const receiverId = searchParams.get('receiverId');

    if (!receiverId) {
      return NextResponse.json(
        { message: 'Receiver ID is required' },
        { status: 400 }
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

    // Get messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            AND: [
              { senderId: user.id },
              { receiverId },
            ],
          },
          {
            AND: [
              { senderId: receiverId },
              { receiverId: user.id },
            ],
          },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: receiverId,
        receiverId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 