import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapboxMap } from '@/hooks/useMapboxMap';
import { useUserLocation } from '@/hooks/useUserLocation';
import { api, type EventItem } from '@/lib/api-client';
import { metersToMiles } from '@/lib/location-utils';

interface MapboxMapProps {
  selectedEventTypes?: string[];
  className?: string;
}

export default function MapboxMap({ selectedEventTypes = [], className = '' }: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [popup, setPopup] = useState<mapboxgl.Popup | null>(null);
  const { coords: userCoords } = useUserLocation();

  // Filter events based on selected types
  const filteredEvents = events.filter(event => {
    if (selectedEventTypes.length === 0) return true;
    return event.eventType && selectedEventTypes.includes(event.eventType);
  });

  // Handle map load
  const handleMapLoad = useCallback(async (map: mapboxgl.Map) => {
    console.log('Mapbox map loaded successfully!');
    // Center on user location if available
    if (userCoords) {
      map.setCenter([userCoords.lng, userCoords.lat]);
      map.setZoom(12);
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
        'text-color': '#ffffff'
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

    map.on('click', 'unclustered-point', (e) => {
      const coordinates = (e.features![0].geometry as any).coordinates.slice();
      const properties = e.features![0].properties;

      // Find the event data from our events array
      const event = events.find(evt => evt.id === properties.id);
      if (!event) return;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Create or update popup with event details
      const popupContent = `
        <div class="p-3 max-w-xs">
          <h3 class="font-semibold text-gray-900 dark:text-white text-sm mb-1">${event.name}</h3>
          ${event.description ? `<p class="text-xs text-gray-600 dark:text-gray-400 mb-2">${event.description}</p>` : ''}
          ${event.eventType ? `<span class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded mb-2">${event.eventType}</span>` : ''}
          ${event.startsAtUtc ? `<p class="text-xs text-gray-500 dark:text-gray-400">${new Date(event.startsAtUtc).toLocaleString()}</p>` : ''}
          ${event.distanceMeters ? `<p class="text-xs text-gray-500 dark:text-gray-400">${metersToMiles(event.distanceMeters).toFixed(1)} mi away</p>` : ''}
        </div>
      `;

      // Remove existing popup
      if (popup) {
        popup.remove();
      }

      // Create new popup
      const newPopup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        className: 'event-popup'
      })
        .setLngLat([coordinates[0], coordinates[1]])
        .setHTML(popupContent)
        .addTo(map);

      setPopup(newPopup);
      setSelectedEvent(event);
    });

    // Change cursor on hover
    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
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

  // Load events from API
  const loadEvents = useCallback(async (mapInstance: mapboxgl.Map) => {
    try {
      const eventData = await api.browse({ range: 90 }); // Get events for next 90 days
      setEvents(eventData);

      // Update clustering data source
      const features = eventData
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

      const source = mapInstance.getSource('events') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features
        });
      }
    } catch (error) {
      console.error('Failed to load events:', error);
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

  // Cleanup popup on unmount
  useEffect(() => {
    return () => {
      if (popup) {
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
