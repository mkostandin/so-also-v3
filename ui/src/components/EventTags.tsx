import React from 'react';

interface EventTagsProps {
  eventType?: string;
  committee?: string;
}

/**
 * EventTags component - displays event type and committee tags
 * Positioned above the separator in the header section for improved visual hierarchy
 */
export default function EventTags({ eventType, committee }: EventTagsProps) {
  return (
    <div className="flex justify-center gap-3">
      {eventType && (
        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-4 py-2 rounded-full font-medium">
          {eventType}
        </span>
      )}
      {committee && (
        <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm px-4 py-2 rounded-full font-medium">
          {committee}
        </span>
      )}
    </div>
  );
}
