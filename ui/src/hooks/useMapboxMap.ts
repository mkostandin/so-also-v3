import { useEffect, useRef, useState, RefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { initializeMapbox, getDefaultMapConfig, getMapboxStyles, cleanupMapContainer, validateMapContainer } from '@/lib/mapbox';

interface UseMapboxMapOptions {
  container: RefObject<HTMLElement>;
  onMapLoad?: (map: mapboxgl.Map) => void;
  onMapError?: (error: Error) => void;
}

export const useMapboxMap = ({ container, onMapLoad, onMapError }: UseMapboxMapOptions) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!container.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate container exists
        if (!container.current) {
          throw new Error('Map container not found');
        }

        // Clean up container before initialization to prevent Mapbox warnings
        cleanupMapContainer(container.current);

        // Small delay to ensure DOM is fully ready
        await new Promise(resolve => setTimeout(resolve, 10));

        // Validate container is ready for Mapbox (with retry)
        if (!validateMapContainer(container.current)) {
          // One more cleanup attempt
          cleanupMapContainer(container.current);
          await new Promise(resolve => setTimeout(resolve, 5));

          if (!validateMapContainer(container.current)) {
            console.warn('Map container validation failed after retry, but proceeding with Mapbox initialization');
          }
        }

        // Initialize Mapbox
        initializeMapbox();

        // Inject CSS to hide attribution
        const styleSheet = document.createElement('style');
        styleSheet.textContent = getMapboxStyles();
        document.head.appendChild(styleSheet);

        // Create map instance
        const map = new mapboxgl.Map({
          container: container.current,
          ...getDefaultMapConfig(),
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add geolocation control
        map.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
          }),
          'top-right'
        );

        // Handle map load
        map.on('load', () => {
          mapRef.current = map;
          setIsLoading(false);
          onMapLoad?.(map);
        });

        // Handle map errors with better container-specific error handling
        map.on('error', (e) => {
          let errorMessage = `Map failed to load: ${e.error?.message || 'Unknown error'}`;

          // Check for container-related errors
          if (e.error?.message?.includes('container') || e.error?.message?.includes('empty')) {
            errorMessage = 'Map container error: Please ensure the map container is properly configured and empty.';
          }

          const error = new Error(errorMessage);
          setError(error);
          setIsLoading(false);
          onMapError?.(error);
        });

        return () => {
          map.remove();
          document.head.removeChild(styleSheet);
          // Clean up container when map is removed
          if (container.current) {
            cleanupMapContainer(container.current);
          }
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize map');
        setError(error);
        setIsLoading(false);
        onMapError?.(error);
      }
    };

    const cleanup = initializeMap();

    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, [container.current, onMapLoad, onMapError]);

  return {
    map: mapRef.current,
    isLoading,
    error,
  };
};
