'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  date: string;
}

export default function TutorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Mock data - replace with actual API call
  const tutor = {
    id: params.id,
    name: 'John Doe',
    subjects: ['Mathematics', 'Physics'],
    hourlyRate: 500,
    rating: 4.8,
    location: 'Addis Ababa',
    image: 'https://via.placeholder.com/150',
    bio: 'Experienced mathematics and physics tutor with over 5 years of teaching experience. I specialize in helping students understand complex concepts through practical examples and interactive learning methods.',
    education: [
      {
        degree: 'MSc in Physics',
        institution: 'Addis Ababa University',
        year: '2020',
      },
      {
        degree: 'BSc in Mathematics',
        institution: 'Addis Ababa University',
        year: '2018',
      },
    ],
    experience: [
      {
        title: 'Mathematics Teacher',
        institution: 'St. Joseph School',
        duration: '2018-2020',
      },
      {
        title: 'Physics Tutor',
        institution: 'Self-employed',
        duration: '2020-Present',
      },
    ],
  };

  const reviews: Review[] = [
    {
      id: '1',
      rating: 5,
      comment: 'Excellent tutor! Very patient and explains concepts clearly.',
      reviewerName: 'Sarah M.',
      date: '2024-02-15',
    },
    {
      id: '2',
      rating: 4,
      comment: 'Great teaching methods and very knowledgeable.',
      reviewerName: 'Michael K.',
      date: '2024-02-10',
    },
  ];

  const handleBooking = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    // Implement booking logic
    console.log('Booking session for:', selectedDate, selectedTime);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-8">
              <div className="flex-shrink-0">
                <img
                  src={tutor.image}
                  alt={tutor.name}
                  className="w-32 h-32 rounded-full"
                />
              </div>
              <div className="mt-4 sm:mt-0 flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{tutor.name}</h1>
                <p className="mt-1 text-gray-500">{tutor.location}</p>
                <div className="mt-4 flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-gray-600">{tutor.rating}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-gray-600">ETB {tutor.hourlyRate}/hr</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tutor.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">About</h2>
              <p className="mt-2 text-gray-600">{tutor.bio}</p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Education
                </h2>
                <div className="mt-4 space-y-4">
                  {tutor.education.map((edu, index) => (
                    <div key={index}>
                      <h3 className="font-medium text-gray-900">
                        {edu.degree}
                      </h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-gray-500">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Experience
                </h2>
                <div className="mt-4 space-y-4">
                  {tutor.experience.map((exp, index) => (
                    <div key={index}>
                      <h3 className="font-medium text-gray-900">
                        {exp.title}
                      </h3>
                      <p className="text-gray-600">{exp.institution}</p>
                      <p className="text-gray-500">{exp.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
              <div className="mt-4 space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-gray-600">{review.rating}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-gray-600">{review.reviewerName}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-gray-500">{review.date}</span>
                    </div>
                    <p className="mt-2 text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Book a Session
              </h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Time
                  </label>
                  <select
                    id="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleBooking}
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Book Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 