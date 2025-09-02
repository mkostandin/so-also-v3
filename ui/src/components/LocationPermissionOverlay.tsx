import { useUserLocation } from '@/hooks/useUserLocation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';

export default function LocationPermissionOverlay() {
  const { status, request } = useUserLocation();

  // Only show overlay when location is denied or prompt (not during checking)
  if (status !== 'denied' && status !== 'prompt') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <Card className="p-4 shadow-lg border-orange-200 bg-orange-50 dark:bg-orange-950/50 dark:border-orange-800">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Enable Location for Better Results
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Grant location access to see events near you. Currently showing events from Derry, NH area.
            </p>
            <Button
              onClick={request}
              size="sm"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              <MapPin className="h-3 w-3 mr-1" />
              Enable Location
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
