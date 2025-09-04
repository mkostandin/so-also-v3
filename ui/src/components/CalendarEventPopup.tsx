import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceMiles } from '@/lib/location-utils';

interface CalendarEventPopupProps {
  events: CalendarEvent[];
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export default function CalendarEventPopup({ events, date, isOpen, onClose, onEventClick }: CalendarEventPopupProps) {
  if (!isOpen || events.length === 0) return null;

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <Card
        className="max-w-md w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Events on {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
              aria-label="Close event popup"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-3">
          {events
            .sort((a, b) => {
              // Sort by time, then by distance
              const aTime = a.startsAtUtc ? new Date(a.startsAtUtc).getTime() : Infinity;
              const bTime = b.startsAtUtc ? new Date(b.startsAtUtc).getTime() : Infinity;
              if (aTime !== bTime) return aTime - bTime;
              return (a.distanceMeters || 0) - (b.distanceMeters || 0);
            })
            .map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight">
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

                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{event.startsAtUtc ? formatTime(event.startsAtUtc) : ''}</span>
                  </div>

                  {event.distanceMeters !== undefined && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{formatDistanceMiles(event.distanceMeters)}</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {event.description}
                  </p>
                )}

                <div className="flex justify-end">
                  <Link to={`/app/e/${event.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => onEventClick?.(event)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
        </div>


      </Card>
    </div>
  );
}
