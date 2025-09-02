import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { useMapboxMap } from '@/hooks/useMapboxMap';
import { useUserLocation } from '@/hooks/useUserLocation';
import { api, type EventItem } from '@/lib/api-client';
import MapLayers from './MapLayers';
import MapControls from './MapControls';

interface MapboxMapProps {
  selectedEventTypes?: string[];
  className?: string;
  retryCount?: number;
}

export default function MapboxMap({ selectedEventTypes = [], className = '', retryCount = 0 }: MapboxMapProps) {
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

  // Handle navigation to event details
  const handleLearnMore = useCallback((event: EventItem) => {
    // Navigate to event details page (correct URL format)
    navigate(`/app/e/${event.id}`);
  }, [navigate]);

  // Load events from API with progressive loading
  const loadEvents = useCallback(async (mapInstance: mapboxgl.Map) => {
    try {
      // Load fewer events initially for faster map load
      const initialEventData = await api.browse({ range: 30 }); // Get events for next 30 days

      setEvents(initialEventData);

      // Load additional events in background
      setTimeout(async () => {
        try {
          const additionalEventData = await api.browse({ range: 90 }); // Get events for next 90 days
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
  }, []);

  // Handle map load - simplified with component delegation
  const handleMapLoad = useCallback(async (map: mapboxgl.Map) => {
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
  }, [userCoords, loadEvents]);

  // Handle map errors
  const handleMapError = useCallback((_error: Error) => {
    // Map error handling is managed by the parent component
    console.debug('Map error handled by parent component:', _error);
  }, []);

  // Use the map hook
  const { map, isLoading, error } = useMapboxMap({
    container: mapContainerRef as React.RefObject<HTMLElement>,
    onMapLoad: handleMapLoad,
    onMapError: handleMapError,
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

    const popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: true,
      className: 'event-popup',
      maxWidth: '320px'
    })
      .setLngLat(coordinates)
      .setDOMContent(popupContainer)
      .addTo(map);

    // Render React component into popup
    try {
      const root = createRoot(popupContainer);

      // Simple popup content for now
      root.render(
        React.createElement('div', { className: 'p-4' },
          React.createElement('h3', { className: 'font-semibold mb-2' }, event.name),
          React.createElement('p', { className: 'text-sm mb-3' }, event.description || ''),
          React.createElement('button', {
            className: 'w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded',
            onClick: () => {
              popup.remove();
              handleLearnMore(event);
            }
          }, 'Learn More')
        )
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

    // Cleanup on popup close
    popup.on('close', () => {
      const typedPopup = popup as { _reactRoot?: ReturnType<typeof createRoot> };
      if (typedPopup._reactRoot) {
        typedPopup._reactRoot.unmount();
      }
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
      {/* Loading overlay - positioned outside map container */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg z-10 pointer-events-none">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map container - must remain completely empty for Mapbox */}
      <div
        ref={mapContainerRef}
        className="h-full w-full rounded-lg relative"
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
