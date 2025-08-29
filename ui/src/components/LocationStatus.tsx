import { useUserLocation } from '@/hooks/useUserLocation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function LocationStatus() {
  const { status, error, request } = useUserLocation();

  const getStatusInfo = () => {
    switch (status) {
      case 'granted':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          message: 'Location access granted',
          description: 'Events are filtered to show those within 50 miles of your location.',
          variant: 'success' as const,
        };
      case 'denied':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-600" />,
          message: 'Location access denied',
          description: 'Events are shown using a default location. Enable location for better results.',
          variant: 'error' as const,
        };
      case 'prompt':
        return {
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          message: 'Location permission needed',
          description: 'Grant location access to see events near you.',
          variant: 'warning' as const,
        };
      default:
        return {
          icon: <MapPin className="h-4 w-4 text-gray-600" />,
          message: 'Location status unknown',
          description: 'Checking location permissions...',
          variant: 'neutral' as const,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="p-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {statusInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {statusInfo.message}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {statusInfo.description}
          </p>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Error: {error}
            </p>
          )}
        </div>
        {(status === 'prompt' || status === 'denied') && (
          <Button
            onClick={request}
            size="sm"
            variant="outline"
            className="flex-shrink-0"
          >
            Enable Location
          </Button>
        )}
      </div>
    </Card>
  );
}
