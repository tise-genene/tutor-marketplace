'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';

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

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (start: string, end: string) => void;
  editable?: boolean;
  selectable?: boolean;
  height?: string;
}

export default function Calendar({
  events,
  onEventClick,
  onDateSelect,
  editable = false,
  selectable = true,
  height = '600px',
}: CalendarProps) {
  const [currentEvents, setCurrentEvents] = useState<CalendarEvent[]>(events);

  useEffect(() => {
    setCurrentEvents(events);
  }, [events]);

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const calendarEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      extendedProps: event.extendedProps,
    };
    
    onEventClick?.(calendarEvent);
  };

  const handleDateSelect = (selectInfo: any) => {
    const start = format(selectInfo.start, "yyyy-MM-dd'T'HH:mm:ss");
    const end = format(selectInfo.end, "yyyy-MM-dd'T'HH:mm:ss");
    onDateSelect?.(start, end);
  };

  const getEventColor = (type: string, status?: string) => {
    switch (type) {
      case 'session':
        return status === 'confirmed' ? '#10B981' : '#F59E0B';
      case 'availability':
        return '#3B82F6';
      case 'booking':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const calendarEvents = currentEvents.map(event => ({
    ...event,
    backgroundColor: getEventColor(event.extendedProps.type, event.extendedProps.status),
    borderColor: getEventColor(event.extendedProps.type, event.extendedProps.status),
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule</h3>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Confirmed Sessions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Pending Sessions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Availability</span>
          </div>
        </div>
      </div>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="timeGridWeek"
        editable={editable}
        selectable={selectable}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={calendarEvents}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height={height}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        slotDuration="00:30:00"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: 'short',
        }}
      />
    </div>
  );
}
