import React from 'react';
import { metersToMiles } from '@/lib/location-utils';

interface EventContentProps {
  description?: string | null;
  startsAtUtc?: string | null;
  address?: string | null;
  city?: string | null;
  stateProv?: string | null;
  distanceMeters?: number | null;
  formatDate: (dateString: string) => string;
}

export default function EventContent({
  description,
  startsAtUtc,
  address,
  city,
  stateProv,
  distanceMeters,
  formatDate
}: EventContentProps) {
  return (
    <div className="space-y-4">
      {description && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-left">{description}</p>
        </div>
      )}

      {startsAtUtc && (
        <div className="text-left">
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatDate(startsAtUtc)}
          </p>
        </div>
      )}

      {(address || city || stateProv) && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-left">Location</h3>
          <div className="text-left space-y-1">
            {address && (
              <p className="text-gray-700 dark:text-gray-300">{address}</p>
            )}
            {(city || stateProv) && (
              <p className="text-gray-700 dark:text-gray-300">
                {[city, stateProv].filter(Boolean).join(', ')}
              </p>
            )}
            {distanceMeters !== undefined && isFinite(distanceMeters) && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {metersToMiles(distanceMeters).toFixed(1)} miles away
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
