import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, Clock, MapPin, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/students/calendar-events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Failed to fetch calendar events: ${response.status} ${txt}`);
      }

      const eventsData = await response.json();
      // If backend returns no events, synthesize from jobs as a fallback
      if (Array.isArray(eventsData) && eventsData.length > 0) {
        setEvents(eventsData);
      } else {
        try {
          const jobsRes = await fetch(`${API_BASE_URL}/api/jobs`, { headers: { 'Content-Type': 'application/json' } });
          if (jobsRes.ok) {
            const jobs = await jobsRes.json();
            const now = new Date();
            const synth = [];
            jobs.forEach(job => {
              // Drive date event
              if (job.driveDate) {
                const d = new Date(job.driveDate);
                if (!isNaN(d.getTime()) && d >= now) {
                  synth.push({
                    id: `drive-${job._id}`,
                    title: `Job Drive - ${job.position || job.title || 'Position'}`,
                    start: d,
                    allDay: true,
                    color: '#10B981',
                    extendedProps: {
                      type: 'drive',
                      company: job.companyName,
                      position: job.position,
                      location: job.location,
                      package: job.salaryPackage
                    }
                  });
                }
              }
              // Application deadline event
              if (job.applicationDeadline) {
                const d = new Date(job.applicationDeadline);
                if (!isNaN(d.getTime()) && d >= now) {
                  synth.push({
                    id: `deadline-${job._id}`,
                    title: `Deadline - ${job.position || job.title || 'Position'}`,
                    start: d,
                    allDay: true,
                    color: '#F59E0B',
                    extendedProps: {
                      type: 'deadline',
                      company: job.companyName,
                      position: job.position,
                      action: 'Application Deadline'
                    }
                  });
                }
              }
            });
            setEvents(synth);
          } else {
            setEvents([]);
          }
        } catch (e) {
          console.warn('Fallback jobs fetch for calendar failed:', e);
          setEvents([]);
        }
      }
      
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info) => {
    const eventProps = info.event.extendedProps;
    setSelectedEvent({
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      allDay: info.event.allDay,
      color: info.event.backgroundColor,
      ...eventProps
    });
    setShowEventModal(true);
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'interview':
        return <Clock className="h-4 w-4" />;
      case 'drive':
        return <Building className="h-4 w-4" />;
      case 'deadline':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'interview':
        return 'Interview';
      case 'drive':
        return 'Job Drive';
      case 'deadline':
        return 'Application Deadline';
      default:
        return 'Event';
    }
  };

  const formatEventTime = (start, end, allDay) => {
    if (allDay) {
      return 'All Day';
    }
    
    const options = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    
    const startTime = new Date(start).toLocaleTimeString([], options);
    const endTime = end ? new Date(end).toLocaleTimeString([], options) : null;
    
    return endTime ? `${startTime} - ${endTime}` : startTime;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">My Calendar</h2>
        </div>
        <div className="text-sm text-gray-600">
          {events.length} upcoming events
        </div>
      </div>

      {/* Event Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Interviews</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Job Drives</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Deadlines</span>
        </div>
      </div>

      {/* FullCalendar Component */}
      <div className="bg-white p-4 rounded-lg shadow">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
          moreLinkClick="popover"
          eventMouseEnter={(info) => {
            info.el.style.cursor = 'pointer';
          }}
          dayCellContent={(info) => {
            return { html: info.dayNumberText };
          }}
        />
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getEventTypeIcon(selectedEvent.type)}
                <h3 className="text-lg font-semibold text-gray-900">
                  {getEventTypeLabel(selectedEvent.type)}
                </h3>
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">{selectedEvent.position}</h4>
                <p className="text-sm text-gray-600">{selectedEvent.company}</p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(selectedEvent.start).toLocaleDateString()} • {' '}
                  {formatEventTime(selectedEvent.start, selectedEvent.end, selectedEvent.allDay)}
                </span>
              </div>
              
              {selectedEvent.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              
              {selectedEvent.round && (
                <div className="text-sm">
                  <span className="font-medium">Round:</span> {selectedEvent.round}
                </div>
              )}
              
              {selectedEvent.package && (
                <div className="text-sm">
                  <span className="font-medium">Package:</span> {selectedEvent.package}
                </div>
              )}
              
              {selectedEvent.action && (
                <div className="text-sm">
                  <span className="font-medium">Action:</span> {selectedEvent.action}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCalendar;