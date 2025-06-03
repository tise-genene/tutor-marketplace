import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';
import { Session } from 'next-auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;

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

    // Get all unique conversations (users who have exchanged messages with the current user)
    const conversations = await prisma.$queryRaw`
      WITH LastMessages AS (
        SELECT DISTINCT ON (
          CASE 
            WHEN sender_id = ${user.id} THEN receiver_id
            ELSE sender_id
          END
        )
          CASE 
            WHEN sender_id = ${user.id} THEN receiver_id
            ELSE sender_id
          END as other_user_id,
          content,
          created_at,
          read,
          id
        FROM "Message"
        WHERE sender_id = ${user.id} OR receiver_id = ${user.id}
        ORDER BY other_user_id, created_at DESC
      )
      SELECT 
        lm.other_user_id as id,
        u.name,
        u.role,
        lm.content as "lastMessage.content",
        lm.created_at as "lastMessage.createdAt",
        lm.read as "lastMessage.read",
        (
          SELECT COUNT(*)
          FROM "Message" m
          WHERE m.sender_id = lm.other_user_id
          AND m.receiver_id = ${user.id}
          AND m.read = false
        ) as "unreadCount"
      FROM LastMessages lm
      JOIN "User" u ON u.id = lm.other_user_id
      ORDER BY lm.created_at DESC
    `;

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 