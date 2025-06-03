'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, BookOpen, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  subject: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  student: {
    id: string;
    name: string;
    email: string;
  };
  tutor: {
    id: string;
    name: string;
    email: string;
  };
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      // Refresh bookings after update
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      setError('Failed to update booking status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No bookings found</p>
            <button
              onClick={() => router.push('/search')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Find a Tutor
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md p-6 space-y-4"
              >
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-gray-900">
                      {new Date(booking.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="text-gray-900">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Subject</p>
                    <p className="text-gray-900">{booking.subject}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {session?.user?.role === 'STUDENT' ? 'Tutor' : 'Student'}
                    </p>
                    <p className="text-gray-900">
                      {session?.user?.role === 'STUDENT'
                        ? booking.tutor.name
                        : booking.student.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {booking.status === 'PENDING' && (
                    <ClockIcon className="w-5 h-5 text-yellow-500" />
                  )}
                  {booking.status === 'CONFIRMED' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {booking.status === 'CANCELLED' && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      booking.status === 'PENDING'
                        ? 'text-yellow-600'
                        : booking.status === 'CONFIRMED'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                  </span>
                </div>

                {session?.user?.role === 'TUTOR' && booking.status === 'PENDING' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {session?.user?.role === 'STUDENT' && booking.status === 'PENDING' && (
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 