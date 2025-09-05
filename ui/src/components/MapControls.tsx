import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapControlsProps {
  map: mapboxgl.Map;
}

export default function MapControls({ map }: MapControlsProps) {
  // No controls needed - geolocate control is handled in useMapboxMap hook
  // All other controls have been removed for a cleaner interface
  return null;
}
