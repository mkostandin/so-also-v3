# Debug Mode - Development Testing Feature

## Overview

Debug mode allows developers to easily toggle between test data and production data during development. This is particularly useful when building frontend features that need realistic data.

## How It Works

### Automatic API Integration
- When debug mode is **ON**: All GET API calls automatically include `?includeTestData=true`
- When debug mode is **OFF**: API calls return production data only (filtered test data)

### Settings Panel
- Located in **Settings → Debug Mode**
- Toggle switch to enable/disable debug mode
- Settings are persisted in localStorage
- **Default**: Enabled for development

## Usage

### In Development
1. Go to Settings page
2. Ensure "Include Test Data in API Calls" is **ON** (default)
3. All your app's API calls will now return test data automatically
4. You'll see 100+ events and 17 committees

### For Production Testing
1. Toggle debug mode **OFF** in Settings
2. API calls will return 0 results (production clean)
3. Perfect for testing production behavior

### Manual Override
You can still manually add `?includeTestData=true` to any URL for one-off testing, regardless of the debug mode setting.

## API Endpoints Affected

All these endpoints automatically respect debug mode:
- `/api/v1/browse` - Events and occurrences
- `/api/v1/events` - Event listings
- `/api/v1/occurrences` - Occurrence listings
- `/api/v1/committees` - Committee listings

## Data

### With Debug Mode ON
- **100 Events**: Future events across all committees
- **17 Committees**: All committee types (regional, advisory, BID)
- **Geographic Data**: Proper coordinates for mapping

### With Debug Mode OFF
- **0 Events**: Production filtering (no test data)
- **0 Committees**: Production filtering (no test data)

## Implementation

### Files Modified
- `ui/src/lib/debug-settings.ts` - Debug settings management
- `ui/src/lib/api-client.ts` - Automatic parameter injection
- `ui/src/components/DebugSettings.tsx` - Settings UI component
- `ui/src/pages/Settings.tsx` - Settings page integration

### Backend Support
The backend already supports `?includeTestData=true` parameter on all endpoints, which this feature uses automatically.

## Benefits

✅ **Easy Development**: Toggle one switch to see test data
✅ **Safe Production**: No accidental test data exposure
✅ **Persistent**: Settings saved between sessions
✅ **Flexible**: Manual override still available
✅ **Transparent**: Clear UI feedback about current mode

## Testing

Run the test script to verify functionality:
```bash
node server/test-debug-mode.mjs
```

This will test both debug mode ON and OFF scenarios.
