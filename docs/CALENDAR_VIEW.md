# Calendar View Documentation

## Overview

The Calendar View provides an interactive calendar interface for discovering and exploring events by date. It integrates with the application's location services and filtering system to display relevant events based on user preferences and location.

## 📅 Core Features

### Calendar Interface
- **Monthly Calendar**: Traditional calendar layout with clear date navigation
- **Event Indicators**: Visual indicators on dates containing events
- **Today Highlighting**: Current date clearly highlighted for easy reference
- **Responsive Design**: Optimized for all screen sizes and devices

### Event Display
- **Day View Popups**: Click any date to view events in a detailed overlay
- **Event Details**: Comprehensive event information including:
  - Event title and description
  - Date and time information
  - Location details
  - Event type and category
  - Organizer information

- **Event Count Display**: Clear indication of total events shown
- **Smart Layout**: Events organized by time within each day

### Navigation & Interaction
- **Arrow Navigation**: Intuitive Previous/Next month buttons using Lucide icons
- **Month/Year Display**: Clear current month and year indication
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Touch Optimization**: Mobile-friendly touch interactions

## 🔧 Technical Implementation

### Component Architecture

#### Main Components
- **`CalendarView.tsx`**: Main calendar view component
- **`CalendarEventPopup.tsx`**: Event details popup component
- **`useCalendarEvents.ts`**: Custom hook for event data fetching
- **`DistanceFilter.tsx`**: Distance filtering component

#### Key Files
```
ui/src/routes/CalendarView.tsx           # Main calendar component
ui/src/components/CalendarEventPopup.tsx # Event details popup
ui/src/hooks/useCalendarEvents.ts        # Event data management
ui/src/components/DistanceFilter.tsx     # Distance filtering
```

### Data Flow

#### Event Fetching Process
1. **Location Detection**: Get user location or use fallback coordinates
2. **Distance Calculation**: Apply selected distance filter
3. **API Request**: Call `/api/v1/browse` with location and filter parameters
4. **Data Processing**: Convert API response to calendar-friendly format
5. **Display Update**: Render events on appropriate calendar dates

#### Distance-Based Filtering
```typescript
const distanceOptions = [
  { value: 'all', label: 'All Events', radius: undefined },
  { value: '500', label: '500 miles', radius: 804670 },
  { value: '150', label: '150 miles', radius: 241402 },
  { value: '50', label: '50 miles', radius: 80467 }
];
```

#### Automatic Location Request
```typescript
// In useCalendarEvents.ts - Automatically request location when needed
useEffect(() => {
  if (!userCoords && (status === 'prompt' || status === 'granted')) {
    request(); // Request user location for relevant event filtering
  }
}, [userCoords, status, request]);
```

### State Management

#### Filter Context Integration
- **Distance Selection**: User-selected distance radius
- **Event Type Filters**: Selected event categories
- **Location Data**: User location or fallback coordinates
- **Loading States**: API loading and error states

#### Context Usage
```tsx
const { selectedDistance, setSelectedDistance } = useFilterContext();
const { selectedEventTypes } = useFilterContext();
```

## 🎛️ User Interface

### Filter Controls
- **Distance Filter**: Pill-style buttons for distance selection
- **Event Type Filter**: Consistent with map view filtering
- **Committee Filter**: Multi-select dropdown for filtering events by specific committees
- **Universal Committee Filtering**: Committee selections now apply to calendar events in real-time
- **Real-time Updates**: Immediate filter application
- **State Persistence**: Selections maintained across navigation

### Calendar Layout
- **Grid Layout**: 7-column weekly layout
- **Header Row**: Day of week labels (Sun-Sat)
- **Date Cells**: Individual date containers with event indicators
- **Navigation Header**: Month/year display with arrow controls

### Event Indicators
- **Dot Indicators**: Small dots on dates with events
- **Count Display**: Number of events per date (when applicable)
- **Color Coding**: Different colors for different event types
- **Hover States**: Interactive feedback on hover

## 📱 Responsive Design

### Desktop Experience
- **Multi-column Layout**: Filters alongside calendar
- **Large Calendar**: Maximized calendar viewport
- **Detailed Popups**: Rich event details with full information
- **Keyboard Shortcuts**: Full keyboard navigation support

### Mobile Experience
- **Single Column**: Stacked layout for narrow screens
- **Touch Navigation**: Large touch targets for calendar interaction
- **Simplified Popups**: Optimized popup size for mobile screens
- **Swipe Gestures**: Swipe to navigate between months

### Tablet Experience
- **Adaptive Layout**: Responsive grid system
- **Touch Optimization**: Balanced touch targets and text sizes
- **Flexible Popups**: Appropriate sizing for tablet screens

## 🔍 Event Discovery

### Day View Interaction
- **Click to Expand**: Click any date to open event popup
- **Popup Positioning**: Smart positioning to stay within viewport
- **Z-Index Management**: Proper layering above calendar grid
- **Close Options**: Multiple ways to close popup (click outside, close button)

### Event Details Display
- **Time Sorting**: Events displayed in chronological order
- **Event Cards**: Clean card layout for each event
- **Action Buttons**: Links to full event details or registration
- **Location Info**: Address and distance information

### Search & Filter Integration
- **Cross-Filtering**: Filters work seamlessly with map view
- **Real-time Updates**: Instant results when filters change
- **Smart Defaults**: Sensible default distance (150 miles)
- **Performance Optimized**: Efficient API calls and caching

## 📍 Location Integration

### Geolocation Support
- **Automatic Detection**: Seamless location detection on load
- **Automatic Location Request**: Proactively requests user location when needed for relevant events
- **Permission Handling**: Clear permission request flow
- **Fallback System**: Derry, NH coordinates when location unavailable
- **Accuracy Display**: Location precision indicators

### Distance Calculations
- **Haversine Formula**: Accurate distance calculations
- **Radius Filtering**: Configurable distance-based event filtering
- **Performance Optimized**: Efficient geospatial queries
- **Caching**: Smart caching of location-based results

## 🎨 User Experience Enhancements

### Loading States
- **Skeleton Loading**: Professional loading indicators
- **Progressive Enhancement**: Content appears as it loads
- **Error Handling**: Clear error messages with recovery options
- **Performance Feedback**: Loading progress indication

### Animations & Transitions
- **Smooth Navigation**: Polished month transitions
- **Popup Animations**: Smooth popup open/close animations
- **Filter Transitions**: Immediate filter application feedback
- **Hover Effects**: Subtle interactive feedback

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Logical focus flow and indicators
- **Color Contrast**: WCAG-compliant color schemes

## 🔧 Configuration & Customization

### Distance Options Configuration
```typescript
const DISTANCE_OPTIONS = [
  { value: 'all', label: 'All Events' },
  { value: '500', label: '500 miles' },
  { value: '150', label: '150 miles' },
  { value: '50', label: '50 miles' }
] as const;
```

### Default Settings
- **Default Distance**: 150 miles for optimal coverage
- **Event Limit**: 200 nearest events for performance
- **Fallback Location**: Derry, NH (42.8864, -71.3247)
- **Calendar Style**: Clean, modern calendar design

### API Integration
- **Endpoint**: `/api/v1/browse` with location and filter parameters
- **Parameters**:
  - `lat`: Latitude coordinate
  - `lng`: Longitude coordinate
  - `radius`: Distance radius in meters (optional)
  - `committees`: Array of committee slugs for filtering (optional)
  - `limit`: Maximum events to return

## 🐛 Error Handling

### Common Scenarios
- **Location Unavailable**: Graceful fallback to default coordinates
- **API Failures**: User-friendly error messages with retry options
- **Network Issues**: Offline mode with cached data when available
- **Permission Denied**: Clear instructions for enabling location services

### Recovery Mechanisms
- **Automatic Retry**: Intelligent retry for transient failures
- **Manual Refresh**: User-initiated data refresh options
- **Fallback UI**: Alternative interfaces when full functionality unavailable
- **Error Boundaries**: Component-level error isolation

## 📊 Performance Considerations

### Optimization Features
- **Efficient Rendering**: Minimal re-renders with proper memoization
- **Lazy Loading**: Components load only when needed
- **Debounced Updates**: Throttled filter updates for smooth interaction
- **Memory Management**: Proper cleanup of event listeners and data

### Performance Metrics
- **Initial Load**: < 1 second for calendar rendering
- **Filter Updates**: < 200ms for filter application
- **Popup Display**: < 100ms for event popup rendering
- **Memory Usage**: Optimized memory footprint for large event sets

## 🔧 Developer Integration

### Component Usage
```tsx
import { CalendarView } from '@/routes/CalendarView';

function App() {
  return (
    <FilterProvider>
      <CalendarView />
    </FilterProvider>
  );
}
```

### Hook Usage
```tsx
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

function CustomCalendar() {
  const { events, loading, error } = useCalendarEvents(
    selectedDistance,
    selectedEventTypes
  );

  // Use events data...
}
```

### Event Data Structure
```typescript
interface CalendarEvent {
  id: string;
  name: string;
  startsAtUtc: string;
  latitude: number;
  longitude: number;
  eventType: string;
  // ... additional event properties
}
```

## 🧪 Testing & Quality Assurance

### Test Scenarios
- **Location Permissions**: Test with granted/denied location access
- **Network Conditions**: Test with various network speeds
- **Filter Combinations**: Test multiple filter combinations
- **Edge Cases**: Test with no events, many events, etc.

### Accessibility Testing
- **Keyboard Navigation**: Full keyboard accessibility testing
- **Screen Readers**: Compatibility with popular screen readers
- **Color Contrast**: WCAG compliance verification
- **Touch Targets**: Appropriate touch target sizes

---

*For technical implementation details, refer to the feature plan and review documents in `/docs/features/0020_PLAN.md`, `/docs/features/0020_REVIEW.md`, and `/docs/features/0021_PLAN.md`.*
