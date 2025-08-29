import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { initializeMapbox, getDefaultMapConfig, getMapboxStyles } from '@/lib/mapbox';

interface UseMapboxMapOptions {
  container: HTMLElement | null;
  onMapLoad?: (map: mapboxgl.Map) => void;
  onMapError?: (error: Error) => void;
}

export const useMapboxMap = ({ container, onMapLoad, onMapError }: UseMapboxMapOptions) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!container) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Mapbox
        initializeMapbox();

        // Inject CSS to hide attribution
        const styleSheet = document.createElement('style');
        styleSheet.textContent = getMapboxStyles();
        document.head.appendChild(styleSheet);

        // Create map instance
        const map = new mapboxgl.Map({
          container,
          ...getDefaultMapConfig(),
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

        // Handle map load
        map.on('load', () => {
          mapRef.current = map;
          setIsLoading(false);
          onMapLoad?.(map);
        });

        // Handle map errors
        map.on('error', (e) => {
          const error = new Error(`Map failed to load: ${e.error?.message || 'Unknown error'}`);
          setError(error);
          setIsLoading(false);
          onMapError?.(error);
        });

        return () => {
          map.remove();
          document.head.removeChild(styleSheet);
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
  }, [container, onMapLoad, onMapError]);

  return {
    map: mapRef.current,
    isLoading,
    error,
  };
};
