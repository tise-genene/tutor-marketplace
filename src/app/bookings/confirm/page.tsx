'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, User, BookOpen, DollarSign, ArrowLeft } from 'lucide-react';
import PaymentForm from '@/components/PaymentForm';
import { useToast } from '@/components/ui/use-toast';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  subject: string;
  hourlyRate: number;
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
  tutorProfile: {
    bio: string;
    experience: string;
  };
}

export default function BookingConfirmPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const bookingId = searchParams.get('id');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && bookingId) {
      fetchBooking();
    }
  }, [status, router, bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }
      const data = await response.json();
      setBooking(data.booking);
    } catch (error) {
      setError('Failed to load booking details');
      console.error('Error fetching booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAmount = () => {
    if (!booking) return 0;
    const startTime = new Date(`2000-01-01T${booking.startTime}`);
    const endTime = new Date(`2000-01-01T${booking.endTime}`);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return hours * booking.hourlyRate;
  };

  const handlePaymentSuccess = async () => {
    toast({
      title: "Payment successful!",
      description: "Your booking has been confirmed.",
    });

    // Redirect to bookings page
    router.push('/bookings');
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment failed",
      description: error,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Booking not found'}</p>
          <button
            onClick={() => router.push('/bookings')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const amount = calculateAmount();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/bookings')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Confirm Your Booking</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Booking Details</h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(booking.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-gray-900 font-medium">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <BookOpen className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="text-gray-900 font-medium">{booking.subject}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Tutor</p>
                  <p className="text-gray-900 font-medium">{booking.tutor.name}</p>
                  <p className="text-sm text-gray-500">{booking.tutor.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Hourly Rate</p>
                  <p className="text-gray-900 font-medium">${booking.hourlyRate}/hour</p>
                </div>
              </div>
            </div>

            {/* Tutor Bio */}
            {booking.tutorProfile && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-2">About Your Tutor</h3>
                <p className="text-gray-600 text-sm mb-3">{booking.tutorProfile.bio}</p>
                <p className="text-gray-600 text-sm">
                  <strong>Experience:</strong> {booking.tutorProfile.experience}
                </p>
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {!showPayment ? (
              <div>
                <h2 className="text-xl font-semibold mb-6">Payment Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Hourly Rate</span>
                    <span>${booking.hourlyRate}/hour</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span>
                      {(() => {
                        const startTime = new Date(`2000-01-01T${booking.startTime}`);
                        const endTime = new Date(`2000-01-01T${booking.endTime}`);
                        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                        return `${hours} hour${hours !== 1 ? 's' : ''}`;
                      })()}
                    </span>
                  </div>

                  <hr className="my-4" />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Amount</span>
                    <span className="text-green-600">${amount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full mt-8 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Proceed to Payment
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-6">Complete Payment</h2>
                <PaymentForm
                  proposalId={booking.id}
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
                <button
                  onClick={() => setShowPayment(false)}
                  className="w-full mt-4 text-gray-600 hover:text-gray-800 underline"
                >
                  Back to Summary
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
