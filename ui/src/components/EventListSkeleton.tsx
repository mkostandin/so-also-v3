import { Skeleton } from '@/components/ui/skeleton';

interface EventListSkeletonProps {
  count?: number;
}

export default function EventListSkeleton({ count = 6 }: EventListSkeletonProps) {
  return (
    <ul className="divide-y rounded border bg-white dark:bg-gray-900">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              {/* Event title skeleton */}
              <Skeleton className="h-4 w-3/4" />

              {/* Event address skeleton (optional, but show for consistency) */}
              <Skeleton className="h-3 w-1/2" />

              {/* Event description skeleton */}
              <Skeleton className="h-3 w-2/3" />

              {/* Event date/time skeleton */}
              <Skeleton className="h-3 w-1/3" />
            </div>

            <div className="flex flex-col items-end gap-1 ml-4">
              {/* Distance badge skeleton */}
              <Skeleton className="h-5 w-12" />

              {/* Event type badge skeleton */}
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}