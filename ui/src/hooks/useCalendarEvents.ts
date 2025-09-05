import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  showSkeleton: boolean;
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
export function useCalendarEvents(distance: string = "150", selectedEventTypes: string[] = [], selectedCommittees: string[] = [], userCoords?: { lat: number; lng: number } | null): CalendarEventsData {

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]); // Use separate state for calendar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isFetching, setIsFetching] = useState(false); // Prevent multiple simultaneous fetches
  const lastFetchHadUserCoords = useRef(false); // Track if last fetch had user coordinates
  const isInitialLoad = useRef(true); // Track if this is the initial load
  const currentFetchId = useRef<string | null>(null); // Track current fetch to prevent race conditions

  // Note: Location permission handling is now done in the parent component

  const fetchEvents = useCallback(async () => {
    const fetchId = Math.random().toString(36).substr(2, 9);

    // Set this fetch as the current one
    currentFetchId.current = fetchId;

    // Prevent multiple simultaneous fetches, but allow re-fetch when location becomes available
    if (isFetching) {
      // Check if we have new location data that wasn't available during the previous fetch
      const hasNewLocation = userCoords && !lastFetchHadUserCoords.current;
      if (!hasNewLocation) {
        return;
      }
    }

    try {
      setIsFetching(true);
      setLoading(true);
      setError(null);

      // Track whether this fetch has user coordinates
      lastFetchHadUserCoords.current = !!userCoords;

      // Use user location if available, otherwise fallback to default
      const lat = userCoords?.lat ?? DEFAULT_LAT;
      const lng = userCoords?.lng ?? DEFAULT_LNG;
      const radius = getRadiusFromDistance(distance);


      // Fetch events with location, distance, and committee filtering
      // Only include committees parameter if committees are selected to avoid empty array filtering
      const apiParams = {
        lat,
        lng,
        committees: selectedCommittees.length > 0 ? selectedCommittees : undefined,
      };

      // Only include radius if it's defined (not for "all" distance)
      if (radius !== undefined) {
        apiParams.radius = radius;
      }


      const rawEvents = await api.browse(apiParams);

      // Store raw events without filtering (filtering will happen in useMemo)
      const calendarEvents: CalendarEvent[] = rawEvents.map(event => {
        const eventDate = event.startsAtUtc ? new Date(event.startsAtUtc) : new Date();
        const dateKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD

        return {
          ...event,
          dateKey,
        };
      });

      // Only update state if this is still the current fetch (prevents race conditions)
      if (currentFetchId.current === fetchId) {
        setCalendarEvents(calendarEvents);
      }
    } catch (err) {
      // Only set error if this is still the current fetch
      if (currentFetchId.current === fetchId) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      }
    } finally {
      // Only update loading states if this is still the current fetch
      if (currentFetchId.current === fetchId) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  }, [userCoords?.lat, userCoords?.lng, distance, selectedCommittees]); // More specific dependencies

  useEffect(() => {
    // Only fetch if we have coordinates OR if this is the initial load (to use fallback)
    // But don't fetch if we already fetched with coordinates
    const shouldFetch = (userCoords && !lastFetchHadUserCoords.current) || isInitialLoad.current;

    if (shouldFetch) {
      fetchEvents();
      isInitialLoad.current = false; // Mark that initial load is done
    }
  }, [userCoords?.lat, userCoords?.lng]); // Keep coordinate dependencies

  // Separate effect to handle filter changes (only fetch if we have coordinates)
  useEffect(() => {
    if (userCoords) {
      fetchEvents();
    }
  }, [distance, selectedCommittees]); // Only depend on filters

  // Note: Coordinate availability is now handled by the filter change effect above



  const filteredEvents = useMemo(() => {
    const result = selectedEventTypes.length === 0
      ? calendarEvents
      : calendarEvents.filter(event => event.eventType && selectedEventTypes.includes(event.eventType));

    return result;
  }, [calendarEvents, selectedEventTypes]);

  // Simple skeleton management
  useEffect(() => {
    if (loading) {
      setShowSkeleton(true);
    } else {
      // Hide skeleton when loading is complete, regardless of event count
      const timer = setTimeout(() => setShowSkeleton(false), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);


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
    showSkeleton,
  };
}
