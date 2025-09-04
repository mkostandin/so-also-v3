import { useState, useEffect } from 'react';
import { debugSettings } from '@/lib/debug-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bug } from 'lucide-react';

/**
 * Debug Settings Component
 * Controls debug mode for API calls (include test data)
 */
export default function DebugSettings() {
  const [isDebugModeEnabled, setIsDebugModeEnabled] = useState(debugSettings.isDebugModeEnabled());

  useEffect(() => {
    // Listen for debug mode changes from other parts of the app
    const unsubscribe = debugSettings.addListener((enabled) => {
      setIsDebugModeEnabled(enabled);
    });

    return unsubscribe;
  }, []);

  const handleToggle = () => {
    const newValue = !isDebugModeEnabled;
    debugSettings.setDebugMode(newValue);
    setIsDebugModeEnabled(newValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Debug Mode
        </CardTitle>
        <CardDescription>
          Control whether the app uses test data for development and testing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="debug-mode" className="text-base">
              Include Test Data in API Calls
            </Label>
            <div className="text-sm text-muted-foreground">
              When enabled, all API calls will include test data for development
            </div>
          </div>
          <Switch
            id="debug-mode"
            checked={isDebugModeEnabled}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
}
