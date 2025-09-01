import { useEffect } from 'react';

interface MapLayersProps {
  map: mapboxgl.Map;
  onEventClick: (event: any, coordinates: [number, number]) => void;
}

interface EventData {
  id: string;
  name: string;
  description: string;
  eventType: string;
  latitude: number;
  longitude: number;
  startsAtUtc: null;
  endsAtUtc: null;
  itemType: 'event';
  distanceMeters: null;
  imageUrls: string[];
}

export default function MapLayers({ map, onEventClick }: MapLayersProps) {
  useEffect(() => {
    if (!map) return;

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

    // Add event title labels for unclustered points
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

    // Add click handlers for clusters
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties?.cluster_id;
      if (!clusterId) return;

      (map.getSource('events') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err || zoom == null) return;

          map.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom
          });
        }
      );
    });

    // Add click handlers for event labels
    map.on('click', 'event-labels', (e) => {
      const coordinates = (e.features![0].geometry as any).coordinates.slice();
      const properties = e.features![0].properties;

      if (!properties) return;

      const event: EventData = {
        id: properties.id || '',
        name: properties.name || '',
        description: properties.description || '',
        eventType: properties.eventType || '',
        latitude: coordinates[1],
        longitude: coordinates[0],
        startsAtUtc: null,
        endsAtUtc: null,
        itemType: 'event' as const,
        distanceMeters: null,
        imageUrls: []
      };

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      onEventClick(event, coordinates);
    });

    // Add click handlers for unclustered points
    map.on('click', 'unclustered-point', (e) => {
      const coordinates = (e.features![0].geometry as any).coordinates.slice();
      const properties = e.features![0].properties;

      if (!properties) return;

      const event: EventData = {
        id: properties.id || '',
        name: properties.name || '',
        description: properties.description || '',
        eventType: properties.eventType || '',
        latitude: coordinates[1],
        longitude: coordinates[0],
        startsAtUtc: null,
        endsAtUtc: null,
        itemType: 'event' as const,
        distanceMeters: null,
        imageUrls: []
      };

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      onEventClick(event, coordinates);
    });

    // Add hover effects for clusters
    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
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

    // Add hover effects for unclustered points
    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
      map.setPaintProperty('unclustered-point', 'circle-radius', 10);
      map.setPaintProperty('unclustered-point', 'circle-stroke-width', 3);
      map.setPaintProperty('event-labels', 'text-halo-width', 2);
    });

    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
      map.setPaintProperty('unclustered-point', 'circle-radius', 8);
      map.setPaintProperty('unclustered-point', 'circle-stroke-width', 2);
      map.setPaintProperty('event-labels', 'text-halo-width', 1.5);
    });

    // Add hover effects for event labels
    map.on('mouseenter', 'event-labels', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'event-labels', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      // Cleanup layers and sources when component unmounts
      if (map.getLayer('clusters')) map.removeLayer('clusters');
      if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
      if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point');
      if (map.getLayer('event-labels')) map.removeLayer('event-labels');
      if (map.getSource('events')) map.removeSource('events');
    };
  }, [map, onEventClick]);

  return null; // This component doesn't render anything
}
