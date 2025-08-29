import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { useMapboxMap } from '@/hooks/useMapboxMap';
import { useUserLocation } from '@/hooks/useUserLocation';
import { api, type EventItem } from '@/lib/api-client';
import { metersToMiles } from '@/lib/location-utils';
import EventPreviewPopup from './EventPreviewPopup';

interface MapboxMapProps {
  selectedEventTypes?: string[];
  className?: string;
}

export default function MapboxMap({ selectedEventTypes = [], className = '' }: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [popup, setPopup] = useState<mapboxgl.Popup | null>(null);
  const [popupLoading, setPopupLoading] = useState<boolean>(false);
  const [popupError, setPopupError] = useState<string | null>(null);
  const { coords: userCoords } = useUserLocation();
  const navigate = useNavigate();

  // Filter events based on selected types
  const filteredEvents = events.filter(event => {
    if (selectedEventTypes.length === 0) return true;
    return event.eventType && selectedEventTypes.includes(event.eventType);
  });

  // Handle navigation to event details
  const handleLearnMore = useCallback((event: EventItem) => {
    if (popup) {
      popup.remove();
      setPopup(null);
    }
    // Navigate to event details page (correct URL format)
    navigate(`/app/e/${event.id}`);
  }, [navigate, popup]);

  // Handle map load
  const handleMapLoad = useCallback(async (map: mapboxgl.Map) => {
    console.log('Mapbox map loaded successfully!');
    console.log('Mapbox access token:', !!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN);

    // Center on user location if available
    if (userCoords) {
      map.setCenter([userCoords.lng, userCoords.lat]);
      map.setZoom(12);
    } else {
      // Default to a reasonable location if no user location
      map.setCenter([-122.4194, 37.7749]); // San Francisco
      map.setZoom(10);
    }

    // Add clustering data source
    map.addSource('events', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Add cluster layers
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'events',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          10,
          '#f1f075',
          30,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10,
          30,
          30,
          40
        ]
      }
    });

    // Add cluster count labels
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'events',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#1f2937',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5
      }
    });

    // Add unclustered point layer
    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'events',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#ef4444',
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    console.log('Added unclustered-point layer');

    // Add event title labels for unclustered points (AFTER the point layer)
    map.addLayer({
      id: 'event-labels',
      type: 'symbol',
      source: 'events',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 10,  // At zoom 10, text size is 10
          15, 12   // At zoom 15, text size is 12
        ],
        'text-anchor': 'bottom',
        'text-justify': 'center',
        'text-offset': [0, -1.4],
        'text-max-width': 10,
        'text-allow-overlap': false,
        'text-ignore-placement': false,
        'text-optional': true,
        'text-padding': 2,
        'symbol-placement': 'point',
        'symbol-spacing': 250,
        'minzoom': 11  // Only show labels when zoomed in enough
      },
      paint: {
        'text-color': '#1f2937',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
        'text-opacity': [
          'case',
          ['has', 'point_count'],
          0,
          1
        ]
      }
    });

    console.log('Added event-labels layer');
    console.log('All layers added:', map.getStyle().layers.map(l => l.id));

    // Add click handlers for clusters and points
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      (map.getSource('events') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom
          });
        }
      );
    });

    // Add click handlers for event labels (since they might be on top)
    map.on('click', 'event-labels', (e) => {
      console.log('Event label clicked!');
      const coordinates = (e.features![0].geometry as any).coordinates.slice();
      const properties = e.features![0].properties;

      // Create event object from feature properties (no need to lookup in events array)
      const event = {
        id: properties.id,
        name: properties.name,
        description: properties.description,
        eventType: properties.eventType as any,
        latitude: coordinates[1],
        longitude: coordinates[0],
        startsAtUtc: null,
        endsAtUtc: null,
        itemType: 'event' as const,
        distanceMeters: null,
        imageUrls: []
      };

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Remove existing popup
      if (popup) {
        popup.remove();
      }

      // Create container for React component
      const popupContainer = document.createElement('div');
      popupContainer.id = 'event-popup-container';

      // Create new popup with React component
      const newPopup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        className: 'event-popup',
        maxWidth: '320px'
      })
        .setLngLat([coordinates[0], coordinates[1]])
        .setDOMContent(popupContainer)
        .addTo(map);

      setPopup(newPopup);
      setSelectedEvent(event as EventItem);
      setPopupLoading(true);
      setPopupError(null);

      // Change cursor back to pointer on hover for labels
      map.on('mouseenter', 'event-labels', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'event-labels', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    map.on('click', 'unclustered-point', (e) => {
      console.log('Unclustered point clicked!');
      const coordinates = (e.features![0].geometry as any).coordinates.slice();
      const properties = e.features![0].properties;

      // Create event object from feature properties (no need to lookup in events array)
      const event = {
        id: properties.id,
        name: properties.name,
        description: properties.description,
        eventType: properties.eventType as any,
        latitude: coordinates[1],
        longitude: coordinates[0],
        startsAtUtc: null,
        endsAtUtc: null,
        itemType: 'event' as const,
        distanceMeters: null,
        imageUrls: []
      };

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Remove existing popup
      if (popup) {
        popup.remove();
      }

      // Create container for React component
      const popupContainer = document.createElement('div');
      popupContainer.id = 'event-popup-container';

      // Create new popup with React component
      const newPopup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        className: 'event-popup',
        maxWidth: '320px'
      })
        .setLngLat([coordinates[0], coordinates[1]])
        .setDOMContent(popupContainer)
        .addTo(map);

      setPopup(newPopup);
      setSelectedEvent(event as EventItem);
      setPopupLoading(true);
      setPopupError(null);
    });

    // Change cursor and add hover effects for clusters
    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
      // Add subtle scale animation to cluster
      map.setPaintProperty('clusters', 'circle-radius', [
        'step',
        ['get', 'point_count'],
        22,
        10,
        32,
        30,
        42
      ]);
    });
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = '';
      // Reset cluster size
      map.setPaintProperty('clusters', 'circle-radius', [
        'step',
        ['get', 'point_count'],
        20,
        10,
        30,
        30,
        40
      ]);
    });

    // Change cursor and add hover effects for unclustered points
    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
      // Add subtle scale animation to point
      map.setPaintProperty('unclustered-point', 'circle-radius', 10);
      map.setPaintProperty('unclustered-point', 'circle-stroke-width', 3);
      // Make label more prominent on hover
      map.setPaintProperty('event-labels', 'text-halo-width', 2);
    });
    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
      // Reset point size
      map.setPaintProperty('unclustered-point', 'circle-radius', 8);
      map.setPaintProperty('unclustered-point', 'circle-stroke-width', 2);
      // Reset label halo
      map.setPaintProperty('event-labels', 'text-halo-width', 1.5);
    });

    // Load events
    await loadEvents(map);
  }, [userCoords]);

  // Handle map errors
  const handleMapError = useCallback((error: Error) => {
    console.error('Map error:', error);
  }, []);

  // Use the map hook
  const { map, isLoading, error } = useMapboxMap({
    container: mapContainerRef,
    onMapLoad: handleMapLoad,
    onMapError: handleMapError,
  });

  console.log('Map state:', { map: !!map, isLoading, error });

  // Load events from API
  const loadEvents = useCallback(async (mapInstance: mapboxgl.Map) => {
    try {
      console.log('Loading events from API...');
      const eventData = await api.browse({ range: 90 }); // Get events for next 90 days
      console.log(`Loaded ${eventData.length} events`);

      setEvents(eventData);

      // Update clustering data source
      const validEvents = eventData.filter(event => event.latitude && event.longitude);
      console.log(`Events with coordinates: ${validEvents.length}/${eventData.length}`);

      // If no valid events, add some test data
      let features;
      if (validEvents.length === 0) {
        console.log('No valid events found, adding test data...');
        features = [
          {
            type: 'Feature' as const,
            properties: {
              id: 'test-1',
              name: 'Test Event 1',
              description: 'This is a test event',
              eventType: 'Test',
            },
            geometry: {
              type: 'Point' as const,
              coordinates: [-122.4194, 37.7749] // San Francisco
            }
          },
          {
            type: 'Feature' as const,
            properties: {
              id: 'test-2',
              name: 'Test Event 2',
              description: 'Another test event',
              eventType: 'Test',
            },
            geometry: {
              type: 'Point' as const,
              coordinates: [-122.5091, 37.7649] // Near SF
            }
          }
        ];
        // Add test events to the events state
        setEvents([
          {
            id: 'test-1',
            name: 'Test Event 1',
            description: 'This is a test event',
            eventType: 'Test' as any,
            latitude: 37.7749,
            longitude: -122.4194
          },
          {
            id: 'test-2',
            name: 'Test Event 2',
            description: 'Another test event',
            eventType: 'Test' as any,
            latitude: 37.7649,
            longitude: -122.5091
          }
        ]);
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

      console.log(`Created ${features.length} map features`);
      if (features.length > 0) {
        console.log('Sample feature:', features[0]);
      } else {
        console.log('No valid features to display');
      }

      const source = mapInstance.getSource('events') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features
        });
        console.log('Updated map data source');
      } else {
        console.error('Events source not found');
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      // Add test data on error too
      console.log('API failed, adding test data...');
      const features = [
        {
          type: 'Feature' as const,
          properties: {
            id: 'test-1',
            name: 'Test Event 1',
            description: 'This is a test event',
            eventType: 'Test',
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [-122.4194, 37.7749] // San Francisco
          }
        }
      ];

      setEvents([
        {
          id: 'test-1',
          name: 'Test Event 1',
          description: 'This is a test event',
          eventType: 'Test' as any,
          latitude: 37.7749,
          longitude: -122.4194
        }
      ]);

      const source = mapInstance.getSource('events') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features
        });
      }
    }
  }, []);

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

    const source = map.getSource('events') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features
      });
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

  // Render React component into popup when popup and event are available
  useEffect(() => {
    if (popup && selectedEvent && !(popup as any)._reactRoot) {
      const popupContainer = document.getElementById('event-popup-container');
      if (popupContainer) {
        // Clear existing content
        popupContainer.innerHTML = '';

        try {
          const root = createRoot(popupContainer);

          // Render the component synchronously
          root.render(
            <EventPreviewPopup
              event={selectedEvent}
              onLearnMore={() => handleLearnMore(selectedEvent)}
              isLoading={false}
              error={popupError}
            />
          );

          // Store root for cleanup
          (popup as any)._reactRoot = root;
          setPopupLoading(false);
        } catch (renderError) {
          console.error('Error during React render:', renderError);
          setPopupError('Failed to render event details');
          setPopupLoading(false);
        }

        // Fallback: set loading to false after 3 seconds in case React rendering gets stuck
        setTimeout(() => {
          if (popupLoading) {
            setPopupLoading(false);

            // If still no content, render a simple HTML fallback
            if (!popupContainer.innerHTML || popupContainer.innerHTML.trim() === '') {
              popupContainer.innerHTML = `
                <div class="p-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  <h3 class="font-semibold text-gray-900 dark:text-white text-base mb-2">${selectedEvent.name}</h3>
                  ${selectedEvent.description ? `<p class="text-sm text-gray-600 dark:text-gray-300 mb-3">${selectedEvent.description}</p>` : ''}
                  ${selectedEvent.eventType ? `<span class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded mb-3">${selectedEvent.eventType}</span>` : ''}
                  <button onclick="window.location.href='/app/e/${selectedEvent.id}'" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">
                    Learn More
                  </button>
                </div>
              `;
            }
          }
        }, 3000);
      }
    }
  }, [popup, selectedEvent]);

  // Cleanup popup and React root on unmount
  useEffect(() => {
    return () => {
      if (popup) {
        // Clean up React root if it exists
        if ((popup as any)._reactRoot) {
          (popup as any)._reactRoot.unmount();
        }
        popup.remove();
      }
    };
  }, [popup]);



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
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
    </div>
  );
}
