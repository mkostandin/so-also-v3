import { metersToMiles } from '@/lib/location-utils';
import { formatDateWithOrdinal, formatTimeRange } from '@/lib/session-utils';

interface EventContentProps {
  description?: string | null;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
  address?: string | null;
  city?: string | null;
  stateProv?: string | null;
  distanceMeters?: number | null;
}

export default function EventContent({
  description,
  startsAtUtc,
  endsAtUtc,
  address,
  city,
  stateProv,
  distanceMeters
}: EventContentProps) {
  // Only render if there's content to show
  const hasContent = description || startsAtUtc || address || city || stateProv;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-6">
      {/* Description section */}
      {description && (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-left">{description}</p>
        </div>
      )}

      {/* Date and Time section */}
      {startsAtUtc && (
        <div>
          <p className="text-base text-gray-900 dark:text-white text-left">
            {formatDateWithOrdinal(startsAtUtc)}
          </p>
          <p className="text-base text-gray-700 dark:text-gray-300 text-left mt-1">
            {formatTimeRange(startsAtUtc, endsAtUtc)}
          </p>
        </div>
      )}

      {/* Location section */}
      {(address || city || stateProv) && (
        <div className="text-left">
          {address && (
            <div className="space-y-1">
              {/* Smart address parsing: Split comma-separated address into venue name and street address */}
              {/* This handles cases like "Convention Center, 123 Main St, City, State" */}
              {(() => {
                const addressParts = address.split(', ');

                if (addressParts.length > 1) {
                  // Multi-part address: first part is venue name, rest is street address
                  const venueName = addressParts[0];
                  const streetAddress = addressParts.slice(1).join(', ');
                  return (
                    <>
                      <p className="text-base text-gray-900 dark:text-white leading-snug">
                        {venueName}
                      </p>
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-snug">
                        {streetAddress}
                      </p>
                    </>
                  );
                } else {
                  // Single address line - display as-is
                  return (
                    <p className="text-base text-gray-900 dark:text-white leading-snug">
                      {address}
                    </p>
                  );
                }
              })()}
            </div>
          )}
          {(city || stateProv) && (
            <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
              {[city, stateProv].filter(Boolean).join(', ')}
            </p>
          )}
          {distanceMeters !== undefined && distanceMeters !== null && isFinite(distanceMeters) && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {metersToMiles(distanceMeters).toFixed(1)} miles away
            </p>
          )}
        </div>
      )}
    </div>
  );
}
