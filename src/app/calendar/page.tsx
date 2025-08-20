'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, Clock, User, BookOpen } from 'lucide-react';
import CalendarComponent from '@/components/Calendar';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    type: 'session' | 'availability' | 'booking';
    tutorId?: string;
    studentId?: string;
    subject?: string;
    status?: 'confirmed' | 'pending' | 'cancelled';
  };
}

export default function CalendarPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchCalendarEvents();
    }
  }, [session]);

  const fetchCalendarEvents = async () => {
    try {
      // In a real app, you'd fetch from your API
      // For now, we'll use mock data
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Math Tutoring - Algebra',
          start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          backgroundColor: '#10B981',
          borderColor: '#10B981',
          extendedProps: {
            type: 'session',
            tutorId: 'tutor-1',
            studentId: session?.user?.id,
            subject: 'Mathematics',
            status: 'confirmed',
          },
        },
        {
          id: '2',
          title: 'Physics Review',
          start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
          backgroundColor: '#F59E0B',
          borderColor: '#F59E0B',
          extendedProps: {
            type: 'session',
            tutorId: 'tutor-2',
            studentId: session?.user?.id,
            subject: 'Physics',
            status: 'pending',
          },
        },
        {
          id: '3',
          title: 'Available for Tutoring',
          start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          backgroundColor: '#3B82F6',
          borderColor: '#3B82F6',
          extendedProps: {
            type: 'availability',
            tutorId: session?.user?.id,
            subject: 'All Subjects',
          },
        },
      ];

      setEvents(mockEvents);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setIsLoading(false);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleDateSelect = (start: string, end: string) => {
    // Handle date selection for booking new sessions
    console.log('Selected date range:', { start, end });
    // You could open a booking modal here
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
              <p className="text-gray-600">Manage your tutoring sessions and availability</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <CalendarComponent
              events={events}
              onEventClick={handleEventClick}
              onDateSelect={handleDateSelect}
              selectable={true}
              height="700px"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Confirmed Sessions</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {events.filter(e => e.extendedProps.status === 'confirmed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="text-gray-700">Pending Sessions</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {events.filter(e => e.extendedProps.status === 'pending').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Total Hours</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {events.reduce((total, event) => {
                      const start = new Date(event.start);
                      const end = new Date(event.end);
                      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    }, 0).toFixed(1)}h
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Event Details */}
            {selectedEvent && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedEvent.title}</h4>
                    <p className="text-sm text-gray-600">{selectedEvent.extendedProps.subject}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(selectedEvent.start).toLocaleDateString()} at{' '}
                      {new Date(selectedEvent.start).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedEvent.extendedProps.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : selectedEvent.extendedProps.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEvent.extendedProps.status || 'Available'}
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Book New Session</span>
                </button>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Set Availability</span>
                </button>
                <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Find Tutors</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
