import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, X } from 'lucide-react';
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


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <Card
        className="max-w-md w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xl">
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
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-3">
          {events
            .sort((a, b) => {
              // Sort by time, then by distance for optimal user experience
              const aTime = a.startsAtUtc ? new Date(a.startsAtUtc).getTime() : Infinity;
              const bTime = b.startsAtUtc ? new Date(b.startsAtUtc).getTime() : Infinity;
              if (aTime !== bTime) return aTime - bTime;
              return (a.distanceMeters || 0) - (b.distanceMeters || 0);
            })
            .map((event) => (
              <Link
                key={event.id}
                to={`/app/e/${event.id}`}
                className="block"
                onClick={() => onEventClick?.(event)}
              >
                <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  {/* Custom two-column layout: event details on left, tags on right */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    {/* Left column: Event name, time, and distance */}
                    <div className="flex flex-col gap-1 flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight">
                        {event.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
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
                    </div>
                    {/* Right column: Event type and committee tags with blue color scheme */}
                    <div className="flex flex-col items-end gap-1">
                      {event.eventType && (
                        <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {event.eventType}
                        </div>
                      )}
                      {event.committee && (
                        <div className="text-xs bg-blue-100/50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded truncate max-w-[120px]">
                          {event.committee.length > 15 ? `${event.committee.substring(0, 15)}...` : event.committee}
                        </div>
                      )}
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
        </div>


      </Card>
    </div>
  );
}
