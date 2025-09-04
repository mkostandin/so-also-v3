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
const DEFAULT_LAT = 42.8864; // Derry, NH as fallback
const DEFAULT_LNG = -71.3247;

// Convert distance string to radius meters
const getRadiusFromDistance = (distance: string): number | undefined => {
	switch (distance) {
		case "all": return undefined;
		case "500": return 804670; // 500 miles in meters
		case "150": return 241402; // 150 miles in meters
		case "50": return 80467;   // 50 miles in meters
		default: return 241402;
	}
};

/**
 * Custom hook for fetching and managing calendar events with filtering support
 * @param distance - Distance filter value ("all", "500", "150", "50")
 * @param selectedEventTypes - Array of selected event type filters
 * @param selectedCommittees - Array of selected committee slugs for filtering events
 * @returns Calendar events data with loading states and filtering
 */
export function useCalendarEvents(distance: string = "150", selectedEventTypes: string[] = [], selectedCommittees: string[] = []): CalendarEventsData {
  const { coords: userCoords, status, request } = useUserLocation();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-request location when no coords available
  // This ensures calendar shows relevant events instead of always falling back to Derry, NH
  useEffect(() => {
    if (!userCoords && (status === 'prompt' || status === 'granted')) {
      request();
    }
  }, [userCoords, status, request]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use user location if available, otherwise fallback to default
      const lat = userCoords?.lat ?? DEFAULT_LAT;
      const lng = userCoords?.lng ?? DEFAULT_LNG;
      const radius = getRadiusFromDistance(distance);

      // Fetch events with location, distance, and committee filtering
      // Only include committees parameter if committees are selected to avoid empty array filtering
      const rawEvents = await api.browse({
        lat,
        lng,
        radius,
        committees: selectedCommittees.length > 0 ? selectedCommittees : undefined,
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
  }, [userCoords, distance, selectedCommittees]); // Include selectedCommittees to refetch when committee filters change

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
