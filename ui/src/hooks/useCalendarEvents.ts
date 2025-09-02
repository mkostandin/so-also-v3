import { useEffect, useState, useMemo, useCallback } from 'react';
import { api, EventItem } from '@/lib/api-client';
import { useUserLocation } from './useUserLocation';

export interface CalendarEvent extends EventItem {
  dateKey: string; // YYYY-MM-DD format for calendar grouping
}

export interface CalendarEventsData {
  events: CalendarEvent[];
  eventsByDate: Record<string, CalendarEvent[]>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const DEFAULT_RADIUS_METERS = 80467; // 50 miles in meters
const DEFAULT_LAT = 42.3601; // Boston, MA as fallback (near seeded test data)
const DEFAULT_LNG = -71.0589;

export function useCalendarEvents(range: number = 90, selectedEventTypes: string[] = []): CalendarEventsData {
  const { coords: userCoords } = useUserLocation();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use user location if available, otherwise fallback to default
      const lat = userCoords?.lat ?? DEFAULT_LAT;
      const lng = userCoords?.lng ?? DEFAULT_LNG;
      const radius = DEFAULT_RADIUS_METERS;

      const rawEvents = await api.browse({
        range,
        lat,
        lng,
        radius,
      });

      // Store raw events without filtering (filtering will happen in useMemo)
      const calendarEvents: CalendarEvent[] = rawEvents.map(event => {
        const eventDate = event.startsAtUtc ? new Date(event.startsAtUtc) : new Date();
        const dateKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD

        return {
          ...event,
          dateKey,
        };
      });

      setEvents(calendarEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  }, [userCoords, range]); // Removed selectedEventTypes from dependencies

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    return selectedEventTypes.length === 0
      ? events
      : events.filter(event => event.eventType && selectedEventTypes.includes(event.eventType));
  }, [events, selectedEventTypes]);

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach(event => {
      if (!grouped[event.dateKey]) {
        grouped[event.dateKey] = [];
      }
      grouped[event.dateKey].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  return {
    events: filteredEvents,
    eventsByDate,
    loading,
    error,
    refetch: fetchEvents,
  };
}
