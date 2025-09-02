import mapboxgl from 'mapbox-gl';

// Initialize Mapbox with access token
export const initializeMapbox = () => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  if (!token) {
    throw new Error('VITE_MAPBOX_ACCESS_TOKEN is required. Please add it to your .env file.');
  }
  mapboxgl.accessToken = token;

  // Disable Mapbox telemetry to avoid blocked POSTs to events.mapbox.com
  const setTelemetry = (mapboxgl as unknown as { setTelemetryEnabled?: (enabled: boolean) => void }).setTelemetryEnabled;
  try {
    if (typeof setTelemetry === 'function') {
      setTelemetry(false);
    }
  } catch {
    // no-op if SDK shape changes or method unavailable
  }
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

// Container cleanup utilities
export const cleanupMapContainer = (container: HTMLElement) => {
  if (!container) return;

  // Clear all child elements and text nodes
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Also clear any text content that might remain
  container.textContent = '';

  // Remove any Mapbox-related classes that might interfere
  const mapboxClasses = container.className.split(' ').filter(cls =>
    cls.startsWith('mapbox') ||
    cls.includes('mapboxgl') ||
    cls.includes('map-container')
  );

  if (mapboxClasses.length > 0) {
    container.className = container.className.split(' ')
      .filter(cls => !mapboxClasses.includes(cls))
      .join(' ');
  }

  // Remove any attributes that might interfere with Mapbox (but keep style for positioning)
  const attributesToRemove = ['data-mapbox', 'data-loaded', 'data-map-container'];
  attributesToRemove.forEach(attr => {
    if (container.hasAttribute(attr)) {
      container.removeAttribute(attr);
    }
  });

  // Ensure container has proper positioning for Mapbox
  container.style.position = 'relative';
  container.style.width = '100%';
  container.style.height = '100%';
};

// Validate container is ready for Mapbox initialization
export const validateMapContainer = (container: HTMLElement): boolean => {
  if (!container) return false;

  // Check if container is in DOM
  if (!document.contains(container)) return false;

  // Check if container has any child elements (should be empty for Mapbox)
  if (container.children.length > 0) return false;

  // Check if container has text content (should be empty)
  if (container.textContent && container.textContent.trim().length > 0) return false;

  return true;
};

// Map container styles
export const mapContainerStyles = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

// Error classification utilities
export const classifyMapError = (error: Error) => {
  const message = error.message.toLowerCase();

  // Non-recoverable errors (show error, no retry)
  if (message.includes('access_token') || message.includes('token')) {
    return { type: 'token', recoverable: false };
  }
  if (message.includes('container') && (message.includes('empty') || message.includes('not found'))) {
    return { type: 'container', recoverable: false };
  }
  if (message.includes('configuration') || message.includes('config')) {
    return { type: 'config', recoverable: false };
  }

  // Recoverable errors (retry with backoff)
  if (message.includes('network') || message.includes('fetch')) {
    return { type: 'network', recoverable: true };
  }
  if (message.includes('timeout')) {
    return { type: 'timeout', recoverable: true };
  }
  if (message.includes('style') && (message.includes('404') || message.includes('403'))) {
    return { type: 'style', recoverable: true };
  }
  if (message.includes('4') || message.includes('5')) { // HTTP errors
    return { type: 'http', recoverable: true };
  }

  // User-actionable errors
  if (message.includes('offline') || message.includes('connection')) {
    return { type: 'offline', recoverable: true, userAction: true };
  }
  if (message.includes('permission') || message.includes('denied')) {
    return { type: 'permission', recoverable: false, userAction: true };
  }

  // Default to recoverable unknown error
  return { type: 'unknown', recoverable: true };
};

export const isRecoverableError = (error: Error): boolean => {
  return classifyMapError(error).recoverable;
};

export const getErrorMessage = (error: Error): string => {
  const classification = classifyMapError(error);
  const message = error.message.toLowerCase();

  switch (classification.type) {
    case 'token':
      return 'Mapbox access token is required. Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file.';
    case 'container':
      return 'Map container error. Please refresh the page and try again.';
    case 'config':
      return 'Map configuration error. Please check your setup.';
    case 'network':
      return 'Network connection issue. Please check your connection and try again.';
    case 'timeout':
      return 'Map loading timed out. This can happen on slow connections. Please try again.';
    case 'style':
      return 'Map style failed to load. Please try again.';
    case 'http':
      return 'Server error occurred. Please try again.';
    case 'offline':
      return 'You appear to be offline. Please check your connection and try again.';
    case 'permission':
      return 'Location permission denied. Please allow location access and try again.';
    default:
      if (message.includes('token') || message.includes('access')) {
        return 'Mapbox access token is required. Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file.';
      }
      if (message.includes('container') || message.includes('empty')) {
        return 'Map container error. Please refresh the page and try again.';
      }
      if (message.includes('network') || message.includes('offline')) {
        return 'Network connection issue. Please check your connection and try again.';
      }
      if (message.includes('timeout')) {
        return 'Map loading timed out. This can happen on slow connections. Please try again.';
      }
      return `Map failed to load: ${error.message}`;
  }
};