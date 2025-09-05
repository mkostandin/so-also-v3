import React from 'react';
import { EventItem } from '@/lib/api-client';
import { metersToMiles } from '@/lib/location-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EventPreviewPopupProps {
  event: EventItem;
  onLearnMore: () => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * EventPreviewPopup - Redesigned map marker popup component
 *
 * Features:
 * - Enhanced visual hierarchy with larger titles (text-lg) and smaller descriptions (text-xs)
 * - Structured content layout: Title → Event Tag → Date/Time → Description → Learn More
 * - Smart text truncation (2 lines for title, 3 lines for description)
 * - Improved date formatting ("Sep 7 at 6:00pm")
 * - No close button - dismiss via tap outside or map drag
 */
export default function EventPreviewPopup({ event, onLearnMore, isLoading = false, error = null }: EventPreviewPopupProps) {

  /**
   * Format date and time in the redesigned format
   * Returns "Sep 7 at 6:00pm" format for better readability
   */
  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${month} ${day} at ${time}`;
  };

  const dateTime = formatDateTime(event.startsAtUtc);

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading event details...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center py-4">
          <div className="text-red-500 mb-2 text-sm">⚠️ Error</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm" variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg relative">
      {/* Popup dismissal: No close button - users tap outside map or drag to pan */}

      {/* Event Image - Optional hero image at top of popup */}
      {event.imageUrls && event.imageUrls.length > 0 && (
        <div className="mb-3">
          <img
            src={event.imageUrls[0]}
            alt={event.name}
            className="w-full h-24 object-cover rounded-md"
            onError={(e) => {
              // Hide image if it fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Event Title - Enhanced visual hierarchy with larger text and truncation */}
      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 leading-tight line-clamp-2 relative z-10">
        {event.name}
      </h3>

      {/* Event Type Badge - Secondary visual element in hierarchy */}
      {event.eventType && (
        <div className="mb-2">
          <Badge variant="secondary" className="text-xs">
            {event.eventType}
          </Badge>
        </div>
      )}

      {/* Date and Time - Redesigned format with calendar icon */}
      {dateTime && (
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{dateTime}</span>
        </div>
      )}

      {/* Event Description - Compact text with truncation for better layout */}
      {event.description && (
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
          {event.description}
        </p>
      )}

      {/* Distance */}
      {event.distanceMeters && (
        <div className="mb-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{metersToMiles(event.distanceMeters).toFixed(1)} mi away</span>
        </div>
      )}

      {/* Footer actions - Single full-width button for clean UX */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <Button
          onClick={onLearnMore}
          size="sm"
          className="w-full text-sm"
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}
