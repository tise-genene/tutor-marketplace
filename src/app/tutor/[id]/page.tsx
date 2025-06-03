'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Star, Calendar, MapPin, BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import Chat from '@/components/Chat';

interface TutorProfile {
  id: string;
  name: string;
  email: string;
  tutorProfile: {
    bio: string;
    subjects: string[];
    education: string;
    experience: string;
    hourlyRate: number;
    location: string;
    availability: string;
  };
  reviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    student: {
      name: string;
    };
  }[];
}

export default function TutorProfilePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    fetchTutorProfile();
  }, [params.id]);

  const fetchTutorProfile = async () => {
    try {
      const response = await fetch(`/api/tutors/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tutor profile');
      }
      const data = await response.json();
      setTutor(data);
    } catch (error) {
      setError('Failed to load tutor profile');
      console.error('Error fetching tutor profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSession = () => {
    router.push(`/bookings/new?tutorId=${params.id}`);
  };

  const handleReviewSubmit = () => {
    setShowReviewForm(false);
    fetchTutorProfile(); // Refresh the profile to show the new review
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Tutor not found'}</p>
          <button
            onClick={fetchTutorProfile}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const averageRating =
    tutor.reviews.reduce((sum, review) => sum + review.rating, 0) /
    (tutor.reviews.length || 1);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tutor.name}</h1>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`w-5 h-5 ${
                        value <= averageRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({tutor.reviews.length} reviews)
                </span>
              </div>
            </div>
            <div className="flex space-x-4">
              {session?.user?.role === 'STUDENT' && (
                <>
                  <button
                    onClick={handleBookSession}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                  >
                    Book Session
                  </button>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    {showChat ? 'Hide Chat' : 'Message'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900">{tutor.tutorProfile.location}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <BookOpen className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Subjects</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {tutor.tutorProfile.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <GraduationCap className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Education</p>
                  <p className="text-gray-900">{tutor.tutorProfile.education}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="text-gray-900">{tutor.tutorProfile.experience}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p className="text-gray-900">{tutor.tutorProfile.availability}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700">{tutor.tutorProfile.bio}</p>
            </div>
          </div>

          {showChat && session?.user?.role === 'STUDENT' && (
            <div className="mt-8">
              <Chat receiverId={tutor.id} receiverName={tutor.name} />
            </div>
          )}

          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
              {session?.user?.role === 'STUDENT' && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="text-primary hover:text-primary/90"
                >
                  Write a Review
                </button>
              )}
            </div>

            {showReviewForm && (
              <div className="mb-8">
                <ReviewForm
                  tutorId={tutor.id}
                  bookingId={selectedBookingId}
                  onSubmit={handleReviewSubmit}
                />
              </div>
            )}

            <ReviewList reviews={tutor.reviews} />
          </div>
        </div>
      </div>
    </div>
  );
} 