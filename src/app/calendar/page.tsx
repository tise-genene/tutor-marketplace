'use client';

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSession } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';
import { parseDate, toISOString, formatDateTime } from '@/lib/utils/date';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  type: 'SESSION' | 'AVAILABILITY' | 'REMINDER' | 'CUSTOM';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  location?: string;
  meeting_url?: string;
  tutor_id?: string;
  student_id?: string;
  subject_id?: string;
  booking_id?: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

interface CalendarEventFormatted {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
  className?: string;
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEventFormatted[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCalendarEvents();
    }
  }, [session?.user?.id]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  const fetchCalendarEvents = async () => {
    try {
      const response = await fetch('/api/calendar');
      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.events.map((event: CalendarEvent) => ({
          id: event.id,
          title: event.title,
          start: parseDate(event.start_time) || new Date(),
          end: parseDate(event.end_time) || new Date(),
          resource: event,
          className: getEventClassName(event),
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventClassName = (event: CalendarEvent): string => {
    const baseClass = 'event-item';
    
    // Type-based styling
    switch (event.type) {
      case 'SESSION':
        return `${baseClass} session-event`;
      case 'AVAILABILITY':
        return `${baseClass} availability-event`;
      case 'REMINDER':
        return `${baseClass} reminder-event`;
      case 'CUSTOM':
        return `${baseClass} custom-event`;
      default:
        return baseClass;
    }
  };

  const getEventColor = (event: CalendarEvent): string => {
    // Custom color if specified
    if (event.color) {
      return event.color;
    }

    // Default colors based on type and status
    switch (event.type) {
      case 'SESSION':
        return event.status === 'CONFIRMED' ? '#10B981' : '#F59E0B';
      case 'AVAILABILITY':
        return '#3B82F6';
      case 'REMINDER':
        return '#8B5CF6';
      case 'CUSTOM':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const eventStyleGetter = (event: CalendarEventFormatted) => {
    const color = getEventColor(event.resource);
    return {
      style: {
        backgroundColor: color,
        borderColor: color,
        color: '#FFFFFF',
        borderRadius: '4px',
        padding: '2px 4px',
        fontSize: '12px',
        fontWeight: '500',
      },
    };
  };

  const handleSelect = ({ start, end }: { start: Date; end: Date }) => {
    const title = window.prompt('Please enter a title for your event');
    if (title) {
      createEvent({ title, start, end });
    }
  };

  const createEvent = async (eventData: { title: string; start: Date; end: Date }) => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventData.title,
          startTime: toISOString(eventData.start) || eventData.start.toISOString(),
          endTime: toISOString(eventData.end) || eventData.end.toISOString(),
          type: 'CUSTOM',
        }),
      });

      if (response.ok) {
        await fetchCalendarEvents(); // Refresh events
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleEventSelect = (event: CalendarEventFormatted) => {
    const resource = event.resource;
    const details = `
Title: ${resource.title}
Type: ${resource.type}
Status: ${resource.status}
Start: ${formatDateTime(resource.start_time)}
End: ${formatDateTime(resource.end_time)}
${resource.description ? `Description: ${resource.description}` : ''}
${resource.location ? `Location: ${resource.location}` : ''}
${resource.meeting_url ? `Meeting URL: ${resource.meeting_url}` : ''}
    `.trim();
    
    alert(details);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
            <p className="text-gray-600">
              Manage your tutoring sessions, availability, and reminders
            </p>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Confirmed Sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Pending Sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Availability</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm text-gray-600">Reminders</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-sm text-gray-600">Custom Events</span>
              </div>
            </div>
          </div>

          <div className="calendar-container">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              selectable
              onSelectSlot={handleSelect}
              onSelectEvent={handleEventSelect}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              step={60}
              timeslots={1}
              tooltipAccessor={(event) => event.title}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .calendar-container {
          height: 600px;
        }
        .event-item {
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 12px;
          font-weight: 500;
          color: white;
        }
        .session-event {
          background-color: #10B981;
        }
        .availability-event {
          background-color: #3B82F6;
        }
        .reminder-event {
          background-color: #8B5CF6;
        }
        .custom-event {
          background-color: #6B7280;
        }
      `}</style>
    </div>
  );
}
