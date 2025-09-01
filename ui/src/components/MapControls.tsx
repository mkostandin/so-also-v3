import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapControlsProps {
  map: mapboxgl.Map;
}

export default function MapControls({ map }: MapControlsProps) {
  useEffect(() => {
    if (!map) return;

    // Add scale control with miles instead of km (only unique control)
    const scaleControl = new mapboxgl.ScaleControl({
      unit: 'imperial' // This will show miles instead of km
    });
    map.addControl(scaleControl, 'bottom-left');

    return () => {
      // Remove controls when component unmounts
      const controls = map._controls || [];
      controls.forEach((control: any) => {
        if (control instanceof mapboxgl.ScaleControl) {
          map.removeControl(control);
        }
      });
    };
  }, [map]);

  return null; // This component doesn't render anything
}
