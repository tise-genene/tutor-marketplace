'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Star, Calendar, MapPin, BookOpen, GraduationCap, Briefcase, MessageCircle, Shield, Clock } from 'lucide-react';
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
    isVerified: boolean;
    rating: number;
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
      setError('');
      const response = await fetch(`/api/tutors/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tutor profile');
      }
      const data = await response.json();
      setTutor(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSession = () => {
    router.push(`/tutor/${params.id}/book`);
  };

  const handleReviewSubmit = () => {
    setShowReviewForm(false);
    fetchTutorProfile();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Profile</h2>
          <p className="text-gray-600">Please wait while we fetch the tutor's information...</p>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? 'Something went wrong' : 'Tutor not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'The tutor you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <button 
            onClick={error ? fetchTutorProfile : () => router.back()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            {error ? 'Try Again' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  const averageRating = tutor.reviews.length > 0 
    ? tutor.reviews.reduce((sum, review) => sum + review.rating, 0) / tutor.reviews.length
    : tutor.tutorProfile.rating;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-4xl font-bold text-white">
                    {tutor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {tutor.tutorProfile.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{tutor.name}</h1>
                  {tutor.tutorProfile.isVerified && (
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`w-5 h-5 ${
                          value <= averageRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-blue-100">
                    {averageRating.toFixed(1)} ({tutor.reviews.length} reviews)
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-blue-100">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{tutor.tutorProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{tutor.tutorProfile.experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{tutor.tutorProfile.subjects.length} subjects</span>
                  </div>
                </div>

                <div className="mt-6 text-3xl font-bold">
                  ${tutor.tutorProfile.hourlyRate}/hour
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {tutor.tutorProfile.bio || 'This tutor has not added a bio yet.'}
              </p>
            </div>

            {/* Subjects Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Subjects I Teach</h2>
              <div className="flex flex-wrap gap-3">
                {tutor.tutorProfile.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Education & Experience */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Education & Experience</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Education</h3>
                    <p className="text-gray-600">{tutor.tutorProfile.education || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Experience</h3>
                    <p className="text-gray-600">{tutor.tutorProfile.experience} years of teaching experience</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <ReviewList tutorId={params.id} />
            </div>
          </div>

          {/* Right Column - Action Panel */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${tutor.tutorProfile.hourlyRate}
                  <span className="text-lg text-gray-600 font-normal">/hour</span>
                </div>
                <p className="text-gray-600">Book a session with {tutor.name}</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleBookSession}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Session
                </button>

                {session && (
                  <button
                    onClick={() => setShowChat(true)}
                    className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Send Message
                  </button>
                )}
              </div>

              {/* Availability */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Response</h3>
                <p className="text-sm text-gray-600">Usually responds within 1 hour</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-semibold text-gray-900">98%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Students</span>
                  <span className="font-semibold text-gray-900">45+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lessons Taught</span>
                  <span className="font-semibold text-gray-900">200+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReviewForm && (
        <ReviewForm
          tutorId={params.id}
          bookingId={selectedBookingId}
          onSubmit={handleReviewSubmit}
          onClose={() => setShowReviewForm(false)}
        />
      )}

      {showChat && (
        <Chat
          recipientId={params.id}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}