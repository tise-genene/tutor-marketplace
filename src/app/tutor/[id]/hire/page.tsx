'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Tutor {
  id: string;
  name: string;
  bio: string;
  location: string;
  rating: number;
  subjects: Array<{
    id: string;
    name: string;
    hourlyRate: number;
  }>;
  availability: Record<string, string[]>;
}

export default function HireTutorPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data: session } = useSession();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    fetchTutor();
  }, [id, session]);

  const fetchTutor = async () => {
    try {
      const response = await fetch(`/api/tutors/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTutor(data.success ? data.data : data);
      }
    } catch (error) {
      console.error('Error fetching tutor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutor || !selectedSubject) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: tutor.id,
          subjectId: selectedSubject,
          date: selectedDate,
          startTime,
          endTime,
          coverLetter: notes,
        }),
      });

      const result = await response.json();
      if (result.success) {
        router.push('/bookings?success=true');
      } else {
        alert(result.error?.message || 'Proposal failed');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedSubjectRate = () => {
    if (!tutor || !selectedSubject) return 0;
    const subject = tutor.subjects.find(s => s.id === selectedSubject);
    return subject?.hourlyRate || 0;
  };

  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.max(0, endMinutes - startMinutes) / 60;
  };

  const calculateTotal = () => {
    return getSelectedSubjectRate() * calculateDuration();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading tutor information...</p>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Tutor not found</h1>
        <button 
          onClick={() => router.back()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Tutor Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Hire {tutor.name}</h1>
          <div className="space-y-3">
            <p className="text-gray-600">{tutor.bio}</p>
            <p><strong>Location:</strong> {tutor.location}</p>
            <p><strong>Rating:</strong> ⭐ {tutor.rating}/5</p>
            <div>
              <strong>Available Subjects:</strong>
              <ul className="mt-2 space-y-1">
                {tutor.subjects.map(subject => (
                  <li key={subject.id} className="flex justify-between">
                    <span>{subject.name}</span>
                    <span className="font-semibold">${subject.hourlyRate}/hr</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Hire Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Hire {tutor.name}</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-500"
              >
                <option value="">Choose your subject</option>
                {tutor.subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} (${subject.hourlyRate}/hr)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Project Scope / Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Describe your goals, topics, deadlines, or any additional details."
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-800 resize-none placeholder-gray-500"
              />
            </div>

            {selectedSubject && startTime && endTime && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800">Session Summary</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-800">{calculateDuration()} hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hourly Rate:</span>
                    <span className="font-semibold text-gray-800">${getSelectedSubjectRate()}/hr</span>
                  </div>
                  <div className="border-t border-green-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total Cost:</span>
                      <span className="text-2xl font-bold text-green-600">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Submit Proposal
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


