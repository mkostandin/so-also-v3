import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { useMapboxMap } from '@/hooks/useMapboxMap';
import { useUserLocation } from '@/hooks/useUserLocation';
import { api, type EventItem } from '@/lib/api-client';
import MapLayers from './MapLayers';
import MapControls from './MapControls';
import EventPreviewPopup from './EventPreviewPopup';

/**
 * Props for the MapboxMap component
 */
interface MapboxMapProps {
  /** Array of selected event types to filter markers */
  selectedEventTypes?: string[];
  /** Array of selected committee slugs to filter markers by committee */
  selectedCommittees?: string[];
  /** Additional CSS classes for styling */
  className?: string;
  /** Number of retry attempts for map loading */
  retryCount?: number;
  /** Callback fired when map is fully loaded and ready */
  onReady?: () => void;
  /** Callback fired when map encounters an error */
  onError?: (error: Error) => void;
  /** Callback fired during map loading progress */
  onProgress?: () => void;
}

/**
 * Interactive Mapbox GL map component for displaying events geographically
 *
 * Features:
 * - Event markers with clustering
 * - User location display
 * - Real-time filtering
 * - Responsive design
 * - Error handling and retry logic
 *
 * @param props - Component props
 * @returns React component
 */
export default function MapboxMap({
  selectedEventTypes = [],
  selectedCommittees = [],
  className = '',
  retryCount = 0,
  onReady,
  onError,
  onProgress
}: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const { coords: userCoords, status: locationStatus, request: requestLocation } = useUserLocation();
  const navigate = useNavigate();

  // Log retry attempts for debugging (keep this one for now)
  useEffect(() => {
    if (retryCount > 0) {
      console.log(`MapboxMap retry attempt: ${retryCount}`);
    }
  }, [retryCount]);

  // Request user location on component mount if permission allows
  useEffect(() => {
    if (locationStatus === 'granted' || locationStatus === 'prompt') {
      requestLocation();
    }
  }, [locationStatus, requestLocation]);

  // Filter events based on selected types
  const filteredEvents = events.filter(event => {
    if (selectedEventTypes.length === 0) return true;
    return event.eventType && selectedEventTypes.includes(event.eventType);
  });

  /**
   * Navigate to event details page when user clicks "Learn More" on a marker popup
   * @param event - The event object to navigate to
   */
  const handleLearnMore = useCallback((event: EventItem) => {
    // Navigate to event details page (correct URL format)
    navigate(`/app/e/${event.id}`);
  }, [navigate]);

  /**
   * Load events from API and update map markers with progressive loading
   * Loads initial events quickly, then additional events in background for better UX
   * @param mapInstance - The Mapbox GL map instance to update
   */
  const loadEvents = useCallback(async (mapInstance: mapboxgl.Map) => {
    try {
      // Load fewer events initially for faster map load
      // Include committee filtering if committees are selected
      const initialEventData = await api.browse({
        range: 30, // Get events for next 30 days
        committees: selectedCommittees.length > 0 ? selectedCommittees : undefined
      });

      setEvents(initialEventData);

      // Load additional events in background
      setTimeout(async () => {
        try {
          // Load additional events with same committee filtering
          const additionalEventData = await api.browse({
            range: 90, // Get events for next 90 days
            committees: selectedCommittees.length > 0 ? selectedCommittees : undefined
          });
          setEvents(additionalEventData);
        } catch (_error) {
          // Keep initial events if additional load fails
          console.debug('Failed to load additional events:', _error);
        }
      }, 2000); // Load additional events after 2 seconds

      // Update clustering data source
      const validEvents = initialEventData.filter(event => event.latitude && event.longitude);

      // Create features from valid events
      let features: GeoJSON.Feature[];
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
            startsAtUtc: event.startsAtUtc,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [event.longitude!, event.latitude!]
          }
        }));
      }

      // Update clustering data source if map is ready
      if (mapInstance && mapInstance.isStyleLoaded()) {
        try {
          const source = mapInstance.getSource('events') as mapboxgl.GeoJSONSource;
          if (source) {
            source.setData({
              type: 'FeatureCollection',
              features
            });
          }
        } catch (sourceError) {
          console.warn('Failed to update events source:', sourceError);
        }
      }
    } catch (error) {
      console.warn('Failed to load events:', error);
      // Failed to load events - show empty map
      if (mapInstance && mapInstance.isStyleLoaded()) {
        try {
          const source = mapInstance.getSource('events') as mapboxgl.GeoJSONSource;
          if (source) {
            source.setData({
              type: 'FeatureCollection',
              features: []
            });
          }
        } catch (sourceError) {
          console.warn('Failed to clear events source:', sourceError);
        }
      }
    }
  }, [selectedCommittees]); // Include selectedCommittees to reload events when committee filters change

  // Handle map load - simplified with component delegation
  const handleMapLoad = useCallback(async (map: mapboxgl.Map) => {
    console.log('Map loaded successfully');
    onReady?.();

    // Center on user location if available
    if (userCoords) {
      map.setCenter([userCoords.lng, userCoords.lat]);
      map.setZoom(7);
    } else {
      // Default to Derry, NH (6 Railroad Ave) if no user location
      map.setCenter([-71.3273, 42.8806]); // Derry, NH coordinates
      map.setZoom(7); // Broader view for fallback
    }

    // Initialize event data loading
    if (map) {
      loadEvents(map);
    }
  }, [userCoords, loadEvents, onReady]);

  // Handle map errors
  const handleMapError = useCallback((_error: Error) => {
    // Map error handling is managed by the parent component
    console.debug('Map error handled by parent component:', _error);
    onError?.(_error);
  }, [onError]);

  // Use the map hook
  const { map, isLoading, error } = useMapboxMap({
    container: mapContainerRef as React.RefObject<HTMLElement>,
    onMapLoad: handleMapLoad,
    onMapError: handleMapError,
    onProgress,
  });



  // Update clustering data when events or filters change
  useEffect(() => {
    if (!map) return;

    // Update clustering data source with filtered events
    const features = filteredEvents
      .filter(event => event.latitude && event.longitude)
      .map(event => ({
        type: 'Feature' as const,
        properties: {
          id: event.id,
          name: event.name,
          description: event.description,
          eventType: event.eventType,
          startsAtUtc: event.startsAtUtc,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [event.longitude!, event.latitude!]
        }
      }));

    // Update clustering data source if map is ready
    if (map && map.isStyleLoaded()) {
      try {
        const source = map.getSource('events') as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features
          });
        }
      } catch (sourceError) {
        console.warn('Failed to update filtered events source:', sourceError);
      }
    }
  }, [map, filteredEvents]);

  // Update user location marker
  useEffect(() => {
    if (!map || !userCoords) return;

    // Remove existing user marker if any
    const existingUserMarker = document.querySelector('.user-location-marker');
    if (existingUserMarker) {
      existingUserMarker.remove();
    }

    // Create user location marker
    const userMarkerElement = document.createElement('div');
    userMarkerElement.className = 'user-location-marker';
    userMarkerElement.style.cssText = `
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #3b82f6;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;

    new mapboxgl.Marker({ element: userMarkerElement })
      .setLngLat([userCoords.lng, userCoords.lat])
      .addTo(map);
  }, [map, userCoords]);

  // Center map on user's location when it becomes available after map load
  useEffect(() => {
    if (!map || !userCoords) return;

    // Center map on user's location when it becomes available
    map.setCenter([userCoords.lng, userCoords.lat]);
    map.setZoom(7);
  }, [map, userCoords]);

  // Handle event click from layers
  const handleEventClick = useCallback((event: EventItem, coordinates: [number, number]) => {
    if (!map) return;

    // Create popup directly
    const popupContainer = document.createElement('div');
    popupContainer.id = 'event-popup-container';

    // Create popup with redesigned dismissal UX - no close button, tap outside or drag to close
    const popup = new mapboxgl.Popup({
      closeButton: false, // No close button for cleaner interface
      closeOnClick: true, // Tap outside map closes popup
      className: 'event-popup',
      maxWidth: '320px'
    })
      .setLngLat(coordinates)
      .setDOMContent(popupContainer)
      .addTo(map);

    // Auto-center map on marker when popup opens (popup redesign requirement)
    setTimeout(() => {
      if (popup.isOpen() && map) {
        map.easeTo({
          center: coordinates,
          duration: 300, // Smooth 300ms animation
          easing: (t) => t * (2 - t)
        });
      }
    }, 100);

    // Render EventPreviewPopup component into popup
    try {
      const root = createRoot(popupContainer);

      root.render(
        <EventPreviewPopup
          event={event}
          onLearnMore={() => {
            popup.remove();
            handleLearnMore(event);
          }}
          isLoading={false}
          error={null}
        />
      );

      // Store root for cleanup
      (popup as { _reactRoot?: ReturnType<typeof createRoot> })._reactRoot = root;
    } catch (error) {
      // Fallback to simple HTML
      console.debug('Failed to create React popup, using fallback HTML:', error);
      popupContainer.innerHTML = `
        <div class="p-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h3 class="font-semibold text-gray-900 dark:text-white text-base mb-2">${event.name}</h3>
          ${event.description ? `<p class="text-sm text-gray-600 dark:text-gray-300 mb-3">${event.description}</p>` : ''}
          <button onclick="window.location.href='/app/e/${event.id}'" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">
            Learn More
          </button>
        </div>
      `;
    }

    // Close popup on map drag - redesigned dismissal UX (no close button)
    const handleDragStart = () => {
      if (popup && popup.isOpen()) popup.remove();
    };
    map.on('dragstart', handleDragStart);

    // Cleanup on popup close
    popup.on('close', () => {
      const typedPopup = popup as { _reactRoot?: ReturnType<typeof createRoot> };
      if (typedPopup._reactRoot) {
        typedPopup._reactRoot.unmount();
      }
      map.off('dragstart', handleDragStart);
    });
  }, [map, handleLearnMore]);



  if (error) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2 text-lg">Warning</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error.message.includes('VITE_MAPBOX_ACCESS_TOKEN')
              ? 'Mapbox access token is required. Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file.'
              : 'Failed to load map'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full ${className}`}>
      {/* Loading overlay - positioned relative to map container */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg z-10 pointer-events-none">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map container - must remain completely empty for Mapbox */}
      {/* Responsive corner styling: no rounded corners on mobile for full edge-to-edge display,
          rounded corners on desktop (md+) for polished appearance */}
      <div
        ref={mapContainerRef}
        className="h-full w-full rounded-none md:rounded-lg relative"
        data-map-container="true"
      />

      {/* Map Components - rendered conditionally when map is ready */}
      {map && !isLoading && (
        <>
          <MapLayers map={map} onEventClick={handleEventClick} />
          <MapControls map={map} />
        </>
      )}
    </div>
  );
}
