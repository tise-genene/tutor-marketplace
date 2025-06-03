'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Calendar, Clock, User, BookOpen } from 'lucide-react';

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Get booking details from URL parameters
  const tutorId = searchParams.get('tutorId');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const subject = searchParams.get('subject');

  if (!tutorId || !date || !time || !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Booking Details</h1>
          <p className="mt-2 text-gray-600">Please try booking again.</p>
          <button
            onClick={() => router.push('/search')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutorId,
          date,
          startTime: time,
          endTime: addHour(time), // Assuming 1-hour sessions
          subject,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      router.push('/bookings');
    } catch (error) {
      console.error('Booking error:', error);
      // Handle error (show toast notification)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirm Your Booking</h1>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-gray-900">{formatDate(date)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="text-gray-900">{time} - {addHour(time)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <BookOpen className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="text-gray-900">{subject}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Confirming...' : 'Confirm Booking'}
            </button>

            <button
              onClick={() => router.back()}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function addHour(time: string) {
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hours) + 1);
  date.setMinutes(parseInt(minutes));
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
} 