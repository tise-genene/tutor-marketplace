import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPaymentIntent } from '@/lib/stripe';
import { withApiHandler } from '@/lib/api-middleware';
import { validateRequestBody } from '@/lib/validate-request';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const createPaymentIntentSchema = z.object({
  proposalId: z.string().min(1, 'Proposal ID is required'),
  amount: z.number().positive('Amount must be positive'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const validation = await validateRequestBody(req, createPaymentIntentSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const body = validation.data;
  
  // Get proposal details
  const proposal = await prisma.booking.findUnique({
    where: { id: body.proposalId },
    include: {
      student: true,
      tutor: {
        include: {
          tutorProfile: true,
        },
      },
      subject: true,
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
  }

  // Verify the user is the student who created the proposal
  if (proposal.studentId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Calculate duration from start and end times
  const startTime = new Date(`2000-01-01T${proposal.startTime}`);
  const endTime = new Date(`2000-01-01T${proposal.endTime}`);
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  // Create payment intent
  const paymentIntent = await createPaymentIntent(body.amount, {
    proposalId: body.proposalId,
    studentId: session.user.id,
    tutorId: proposal.tutorId,
    subject: proposal.subject.name,
    hours: durationHours,
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
}
