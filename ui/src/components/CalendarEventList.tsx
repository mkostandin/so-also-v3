import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceMiles } from '@/lib/location-utils';

interface CalendarEventListProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onEventClick?: (event: CalendarEvent) => void;
}

export default function CalendarEventList({ events, selectedDate, onEventClick }: CalendarEventListProps) {
  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'TBD';
    }
  };

  const getEventTypeColor = (eventType?: string) => {
    switch (eventType) {
      case 'Conference':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Committee Meeting':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'YPAA Meeting':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Other':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    }
  };

  if (events.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are no events scheduled for this date.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {events.length} event{events.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="space-y-3">
        {events
          .sort((a, b) => {
            // Sort by time, then by distance
            const aTime = a.startsAtUtc ? new Date(a.startsAtUtc).getTime() : Infinity;
            const bTime = b.startsAtUtc ? new Date(b.startsAtUtc).getTime() : Infinity;
            if (aTime !== bTime) return aTime - bTime;
            return (a.distanceMiles || 0) - (b.distanceMiles || 0);
          })
          .map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {event.name}
                  </h4>
                  {event.eventType && (
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getEventTypeColor(event.eventType)}`}
                    >
                      {event.eventType}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(event.startsAtUtc)}</span>
                  </div>

                  {event.distanceMeters !== undefined && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{formatDistanceMiles(event.distanceMeters)}</span>
                    </div>
                  )}

                  <Badge variant="outline" className="text-xs">
                    {event.itemType === 'occurrence' ? 'Recurring' : 'One-time'}
                  </Badge>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {event.description}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                <Link to={`/app/e/${event.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => onEventClick?.(event)}
                  >
                    <ExternalLink className="h-3 w-3" />
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}
