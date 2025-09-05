import { Skeleton } from '@/components/ui/skeleton';

/**
 * Props for the EventListSkeleton component
 */
interface EventListSkeletonProps {
  /** Number of skeleton items to display (default: 6) */
  count?: number;
}

/**
 * EventListSkeleton Component
 *
 * Displays animated skeleton placeholders that match the structure of real event list items.
 * Provides visual feedback during data loading states, preventing content flashes and
 * improving perceived performance.
 *
 * Features:
 * - Animated skeleton effect using Tailwind's animate-pulse
 * - Matches exact layout and spacing of actual event items
 * - Configurable number of skeleton items
 * - Dark mode compatible
 * - Responsive design
 *
 * @param props - Component props
 * @param props.count - Number of skeleton items to render (default: 6)
 * @returns JSX element containing skeleton event list items
 *
 * @example
 * ```tsx
 * // Basic usage with default count
 * <EventListSkeleton />
 *
 * // Custom count for specific layouts
 * <EventListSkeleton count={10} />
 * ```
 */
export default function EventListSkeleton({ count = 6 }: EventListSkeletonProps) {
  return (
    // Main container with same styling as real event list
    <ul className="divide-y rounded border bg-white dark:bg-gray-900">
      {Array.from({ length: count }).map((_, index) => (
        // Individual skeleton item matching event list item structure
        <li key={index} className="p-3">
          <div className="flex items-center justify-between">
            {/* Left side: Event details section */}
            <div className="flex-1 space-y-2">
              {/* Event title placeholder - largest text element */}
              <Skeleton className="h-4 w-3/4" />

              {/* Event address placeholder - optional field but shown for visual consistency */}
              <Skeleton className="h-3 w-1/2" />

              {/* Event description placeholder - medium length text */}
              <Skeleton className="h-3 w-2/3" />

              {/* Event date/time placeholder - smallest text element */}
              <Skeleton className="h-3 w-1/3" />
            </div>

            {/* Right side: Badges section */}
            <div className="flex flex-col items-end gap-1 ml-4">
              {/* Distance badge placeholder - small rectangular badge */}
              <Skeleton className="h-5 w-12" />

              {/* Event type badge placeholder - slightly wider badge */}
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}