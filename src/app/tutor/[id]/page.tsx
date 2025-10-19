'use client';

import { useState, useEffect } from 'react';
import { useSession } from "@/lib/auth-client";
import { useRouter, useParams } from 'next/navigation';
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

export default function TutorProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const tutorId = (params as any)?.id as string;
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (tutorId) {
      fetchTutorProfile();
    }
  }, [tutorId]);

  const fetchTutorProfile = async () => {
    try {
      setError('');
      const response = await fetch(`/api/tutors/${tutorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tutor profile');
      }
      const payload = await response.json();
      setTutor(payload.data ?? payload);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSession = () => {
    router.push(`/tutor/${tutorId}/hire`);
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
      <section className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto py-8 flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-700">
              {tutor.name.charAt(0).toUpperCase()}
            </div>
            {/* Header Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-extrabold text-gray-900">{tutor.name}</h1>
                {tutor.tutorProfile.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-gray-600">
                <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" /> {tutor.tutorProfile.location}</span>
                <span className="inline-flex items-center gap-1"><Briefcase className="w-4 h-4 text-gray-400" /> {tutor.tutorProfile.experience} years</span>
                <span className="inline-flex items-center gap-1"><BookOpen className="w-4 h-4 text-blue-500" /> {tutor.tutorProfile.subjects.length} subjects</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {[1,2,3,4,5].map((v) => (
                  <Star key={v} className={`w-5 h-5 ${v <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm text-gray-600">{averageRating.toFixed(1)} ({tutor.reviews.length} reviews)</span>
              </div>
            </div>
            {/* Rate & Hire */}
            <div className="text-right">
              <div className="text-3xl font-extrabold text-gray-900">${tutor.tutorProfile.hourlyRate}<span className="text-base text-gray-500 font-normal">/hr</span></div>
              <button onClick={handleBookSession} className="mt-3 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">Hire</button>
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
              <ReviewList reviews={tutor.reviews} />
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
                  Hire
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
          tutorId={tutorId}
          bookingId={selectedBookingId}
          onSubmit={handleReviewSubmit}
        />
      )}

      {showChat && (
        <Chat recipientId={tutorId} receiverName={tutor.name} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}