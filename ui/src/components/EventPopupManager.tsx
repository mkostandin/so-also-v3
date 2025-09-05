import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { type EventItem } from '@/lib/api-client';
import EventPreviewPopup from './EventPreviewPopup';

interface EventPopupManagerProps {
  map: mapboxgl.Map;
  selectedEvent: EventItem | null;
  onLearnMore: (event: EventItem) => void;
}

export default function EventPopupManager({ map, selectedEvent, onLearnMore }: EventPopupManagerProps) {
  const [popup, setPopup] = useState<mapboxgl.Popup | null>(null);
  const [popupLoading, setPopupLoading] = useState<boolean>(false);
  const [popupError, setPopupError] = useState<string | null>(null);

  // Create popup when event is selected
  const createPopup = (_event: EventItem, coordinates: [number, number]) => {
    // Remove existing popup
    if (popup) {
      popup.remove();
    }

    // Create container for React component
    const popupContainer = document.createElement('div');
    popupContainer.id = 'event-popup-container';

    // Create new popup with React component
    const newPopup = new mapboxgl.Popup({
      closeButton: false, // No close button - dismiss via tap outside or drag
      closeOnClick: true,
      className: 'event-popup',
      maxWidth: '320px'
    })
      .setLngLat(coordinates)
      .setDOMContent(popupContainer)
      .addTo(map);

    setPopup(newPopup);
    setPopupLoading(true);
    setPopupError(null);

    return newPopup;
  };

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
              onLearnMore={() => onLearnMore(selectedEvent)}
              isLoading={false}
              error={popupError}
            />
          );

          // Store root for cleanup
          (popup as any)._reactRoot = root;
          setPopupLoading(false);
        } catch (renderError) {
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
  }, [popup, selectedEvent, onLearnMore, popupError, popupLoading]);

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

  return {
    createPopup,
    popup,
    popupLoading,
    popupError,
    setPopupError
  };
}
