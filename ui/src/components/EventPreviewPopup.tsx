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

export default function EventPreviewPopup({ event, onLearnMore, isLoading = false, error = null }: EventPreviewPopupProps) {
  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
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
    <div className="p-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Event Image */}
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

      {/* Event Title */}
      <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-2 leading-tight">
        {event.name}
      </h3>

      {/* Event Type Badge */}
      {event.eventType && (
        <div className="mb-2">
          <Badge variant="secondary" className="text-xs">
            {event.eventType}
          </Badge>
        </div>
      )}

      {/* Event Description */}
      {event.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {event.description}
        </p>
      )}

      {/* Date and Time */}
      {dateTime && (
        <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{dateTime.date}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{dateTime.time}</span>
          </div>
        </div>
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

      {/* Learn More Button */}
      <Button
        onClick={onLearnMore}
        size="sm"
        className="w-full text-sm"
      >
        Learn More
      </Button>
    </div>
  );
}
