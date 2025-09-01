import { useCallback } from 'react';
import { api, type EventItem } from '@/lib/api-client';

interface GeoJSONFeature extends GeoJSON.Feature {
  properties: {
    id: string;
    name: string;
    description: string | null | undefined;
    eventType: string | null | undefined;
  };
}

interface EventDataManagerProps {
  map: mapboxgl.Map;
  onEventsLoaded: (events: EventItem[]) => void;
}

export default function EventDataManager({ map, onEventsLoaded }: EventDataManagerProps) {

  // Load events from API with progressive loading
  const loadEvents = useCallback(async (mapInstance: mapboxgl.Map) => {
    try {
      // Load fewer events initially for faster map load
      const initialEventData = await api.browse({ range: 30 }); // Get events for next 30 days

      onEventsLoaded(initialEventData);

      // Load additional events in background
      setTimeout(async () => {
        try {
          const additionalEventData = await api.browse({ range: 90 }); // Get events for next 90 days
          onEventsLoaded(additionalEventData);
        } catch (error) {
          // Keep initial events if additional load fails
        }
      }, 2000); // Load additional events after 2 seconds

      // Update clustering data source
      const validEvents = initialEventData.filter(event => event.latitude && event.longitude);

      // Create features from valid events
      let features: GeoJSONFeature[];
      if (validEvents.length === 0) {
        // No events to display
        features = [];
      } else {
        features = validEvents.map(event => ({
          type: 'Feature' as const,
          properties: {
            id: event.id,
            name: event.name,
            description: event.description,
            eventType: event.eventType,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [event.longitude!, event.latitude!]
          }
        }));
      }

      const source = mapInstance.getSource('events') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features
        });
      }
    } catch (error) {
      // Failed to load events - show empty map
      const source = mapInstance.getSource('events') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: []
        });
      }
    }
  }, [onEventsLoaded]);

  // Update clustering data when events or filters change
  const updateEventData = useCallback((events: EventItem[]) => {
    if (!map) return;

    // Update clustering data source with filtered events
    const features = events
      .filter(event => event.latitude && event.longitude)
      .map(event => ({
        type: 'Feature' as const,
        properties: {
          id: event.id,
          name: event.name,
          description: event.description,
          eventType: event.eventType,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [event.longitude!, event.latitude!]
        }
      }));

    const source = map.getSource('events') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
  }, [map]);

  // Initialize event loading when map is ready
  const initializeEventData = useCallback(() => {
    if (map) {
      loadEvents(map);
    }
  }, [map, loadEvents]);

  return {
    initializeEventData,
    updateEventData
  };
}
