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

export const POST = withApiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await validateRequestBody(req, createPaymentIntentSchema);
  
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
      tutorSubject: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
  }

  // Verify the user is the student who created the proposal
  if (proposal.studentId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create payment intent
  const paymentIntent = await createPaymentIntent(body.amount, {
    proposalId: body.proposalId,
    studentId: session.user.id,
    tutorId: proposal.tutorId,
    subject: proposal.tutorSubject.subject.name,
    hours: proposal.duration,
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});
