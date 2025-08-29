import mapboxgl from 'mapbox-gl';

// Initialize Mapbox with access token
export const initializeMapbox = () => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  if (!token) {
    throw new Error('VITE_MAPBOX_ACCESS_TOKEN is required. Please add it to your .env file.');
  }
  mapboxgl.accessToken = token;
};

// CSS to hide Mapbox attribution and logo
export const getMapboxStyles = () => `
  .mapboxgl-ctrl-attrib {
    display: none !important;
  }

  .mapboxgl-ctrl-logo {
    display: none !important;
  }

  .mapboxgl-ctrl-attrib.mapboxgl-compact {
    display: none !important;
  }

  .mapboxgl-map {
    font-family: inherit;
  }
`;

// Default map configuration
export const getDefaultMapConfig = () => ({
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-74.5, 40] as [number, number], // Default to NYC area
  zoom: 9,
  pitch: 0,
  bearing: 0,
});

// Map container styles
export const mapContainerStyles = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};
