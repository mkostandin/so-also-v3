import { useEffect } from 'react';
import type { Map, GeoJSONSource, MapMouseEvent, MapboxGeoJSONFeature } from 'mapbox-gl';
import type { EventItem } from '@/lib/api-client';

interface MapLayersProps {
  map: Map;
  onEventClick: (event: EventItem, coordinates: [number, number]) => void;
}

// Type definitions for Mapbox GL events and geometry
type MapboxClickEvent = MapMouseEvent & {
  features?: MapboxGeoJSONFeature[];
};

type PointGeometry = GeoJSON.Point;

export default function MapLayers({ map, onEventClick }: MapLayersProps) {
  useEffect(() => {
    if (!map) return;

    // Check if source already exists before adding
    if (!map.getSource('events')) {
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
    }

    // Add cluster layers only if they don't already exist
    if (!map.getLayer('clusters')) {
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
    }

    // Add cluster count labels only if they don't already exist
    if (!map.getLayer('cluster-count')) {
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
    }

    // Add unclustered point layer only if it doesn't already exist
    if (!map.getLayer('unclustered-point')) {
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
    }

    // Add event title labels for unclustered points only if they don't already exist
    if (!map.getLayer('event-labels')) {
      map.addLayer({
        id: 'event-labels',
        type: 'symbol',
        source: 'events',
        filter: ['!', ['has', 'point_count']],
        minzoom: 11,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 10,
            15, 12
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
          'symbol-spacing': 250
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
    }

    // Add click handlers for clusters (only if layer exists)
    if (map.getLayer('clusters')) {
      map.on('click', 'clusters', (e: MapboxClickEvent) => {
        try {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          });
          if (!features || features.length === 0) return;

          const clusterId = features[0].properties?.cluster_id;
          if (!clusterId) return;

          const source = map.getSource('events') as GeoJSONSource;
          if (!source || typeof source.getClusterExpansionZoom !== 'function') return;

          source.getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err || zoom == null) return;

              const geometry = features[0].geometry as PointGeometry;
              if (!geometry || !geometry.coordinates) return;

              map.easeTo({
                center: geometry.coordinates as [number, number],
                zoom: zoom
              });
            }
          );
        } catch (error) {
          console.warn('Error handling cluster click:', error);
        }
      });
    }

    // Add click handlers for event labels (only if layer exists)
    if (map.getLayer('event-labels')) {
      map.on('click', 'event-labels', (e: MapboxClickEvent) => {
        try {
          if (!e.features || e.features.length === 0) return;

          const geometry = e.features[0].geometry as PointGeometry;
          const coordinates = [...geometry.coordinates] as [number, number];
          const properties = e.features[0].properties;

          if (!properties) return;

          const eventData: EventItem = {
            id: properties.id || '',
            name: properties.name || '',
            description: properties.description || null,
            eventType: (properties.eventType as EventItem['eventType']) || 'Other',
            latitude: coordinates[1],
            longitude: coordinates[0],
            startsAtUtc: properties.startsAtUtc || null,
            endsAtUtc: null,
            itemType: 'event' as const,
            distanceMeters: undefined,
            imageUrls: []
          };

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          onEventClick(eventData, coordinates);
        } catch (error) {
          console.warn('Error handling event label click:', error);
        }
      });
    }

    // Add click handlers for unclustered points (only if layer exists)
    if (map.getLayer('unclustered-point')) {
      map.on('click', 'unclustered-point', (e: MapboxClickEvent) => {
        try {
          if (!e.features || e.features.length === 0) return;

          const geometry = e.features[0].geometry as PointGeometry;
          const coordinates = [...geometry.coordinates] as [number, number];
          const properties = e.features[0].properties;

          if (!properties) return;

          const eventData: EventItem = {
            id: properties.id || '',
            name: properties.name || '',
            description: properties.description || null,
            eventType: (properties.eventType as EventItem['eventType']) || 'Other',
            latitude: coordinates[1],
            longitude: coordinates[0],
            startsAtUtc: properties.startsAtUtc || null,
            endsAtUtc: null,
            itemType: 'event' as const,
            distanceMeters: undefined,
            imageUrls: []
          };

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          onEventClick(eventData, coordinates);
        } catch (error) {
          console.warn('Error handling unclustered point click:', error);
        }
      });
    }

    // Add hover effects for clusters (only if layer exists)
    if (map.getLayer('clusters')) {
      map.on('mouseenter', 'clusters', () => {
        try {
          map.getCanvas().style.cursor = 'pointer';
          if (map.getLayer('clusters')) {
            map.setPaintProperty('clusters', 'circle-radius', [
              'step',
              ['get', 'point_count'],
              22,
              10,
              32,
              30,
              42
            ]);
          }
        } catch (error) {
          console.warn('Error handling cluster mouseenter:', error);
        }
      });

      map.on('mouseleave', 'clusters', () => {
        try {
          map.getCanvas().style.cursor = '';
          if (map.getLayer('clusters')) {
            map.setPaintProperty('clusters', 'circle-radius', [
              'step',
              ['get', 'point_count'],
              20,
              10,
              30,
              30,
              40
            ]);
          }
        } catch (error) {
          console.warn('Error handling cluster mouseleave:', error);
        }
      });
    }

    // Add hover effects for unclustered points (only if layer exists)
    if (map.getLayer('unclustered-point')) {
      map.on('mouseenter', 'unclustered-point', () => {
        try {
          map.getCanvas().style.cursor = 'pointer';
          if (map.getLayer('unclustered-point')) {
            map.setPaintProperty('unclustered-point', 'circle-radius', 10);
            map.setPaintProperty('unclustered-point', 'circle-stroke-width', 3);
          }
          if (map.getLayer('event-labels')) {
            map.setPaintProperty('event-labels', 'text-halo-width', 2);
          }
        } catch (error) {
          console.warn('Error handling unclustered point mouseenter:', error);
        }
      });

      map.on('mouseleave', 'unclustered-point', () => {
        try {
          map.getCanvas().style.cursor = '';
          if (map.getLayer('unclustered-point')) {
            map.setPaintProperty('unclustered-point', 'circle-radius', 8);
            map.setPaintProperty('unclustered-point', 'circle-stroke-width', 2);
          }
          if (map.getLayer('event-labels')) {
            map.setPaintProperty('event-labels', 'text-halo-width', 1.5);
          }
        } catch (error) {
          console.warn('Error handling unclustered point mouseleave:', error);
        }
      });
    }

    // Add hover effects for event labels (only if layer exists)
    if (map.getLayer('event-labels')) {
      map.on('mouseenter', 'event-labels', () => {
        try {
          map.getCanvas().style.cursor = 'pointer';
        } catch (error) {
          console.warn('Error handling event label mouseenter:', error);
        }
      });

      map.on('mouseleave', 'event-labels', () => {
        try {
          map.getCanvas().style.cursor = '';
        } catch (error) {
          console.warn('Error handling event label mouseleave:', error);
        }
      });
    }

    return () => {
      // Cleanup layers and sources when component unmounts
      try {
        // Remove layers if they exist
        const layersToRemove = ['clusters', 'cluster-count', 'unclustered-point', 'event-labels'];
        layersToRemove.forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
        });

        // Remove source if it exists
        if (map.getSource('events')) {
          map.removeSource('events');
        }
      } catch (error) {
        console.warn('Error during MapLayers cleanup:', error);
      }
    };
  }, [map, onEventClick]);

  return null; // This component doesn't render anything
}
