
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Calendar, Clock, BookOpen, CreditCard } from 'lucide-react';
import PaymentForm from '@/components/PaymentForm';

export default function ProposalConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">Loading...</div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);

  const tutorId = searchParams.get('tutorId');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const subjectId = searchParams.get('subjectId');

  if (!tutorId || !date || !time || !subjectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Proposal Details</h1>
          <p className="mt-2 text-gray-600">Please try again.</p>
          <button onClick={() => router.push('/search')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Back to Search</button>
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId,
          date,
          startTime: time,
          endTime: addHour(time),
          subjectId,
        }),
      });
      if (!response.ok) throw new Error('Failed to send proposal');
      
      const data = await response.json();
      setProposalId(data.id);
      setAmount(data.amount || 25); // Default hourly rate
      setShowPayment(true);
    } catch (error) {
      console.error('Proposal error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    router.push('/proposals?success=true');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // You could show a toast notification here
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit Proposal</h1>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="text-gray-900">{formatDate(date)}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Session Time</p>
                <p className="text-gray-900">{time} - {addHour(time)}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <BookOpen className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="text-gray-900">{subjectId}</p>
              </div>
            </div>
          </div>
          {!showPayment ? (
            <div className="mt-8 space-y-4">
              <button onClick={handleConfirm} disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Sending...' : 'Send Proposal'}
              </button>
              <button onClick={() => router.back()} className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200">
                Back
              </button>
            </div>
          ) : (
            <div className="mt-8">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Complete Payment</h2>
              </div>
              {proposalId && (
                <PaymentForm
                  proposalId={proposalId}
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function addHour(time: string) {
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hours) + 1);
  date.setMinutes(parseInt(minutes));
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}


