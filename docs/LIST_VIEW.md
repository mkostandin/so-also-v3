# List View Documentation

## Overview

The List View provides a scrollable, paginated list interface for browsing events in chronological or distance-based order. It offers a clean, text-focused alternative to the map and calendar views, optimized for users who prefer reading through event details systematically.

## 📋 Core Features

### Event List Display
- **Scrollable List**: Clean, card-based event listing with hover effects
- **Event Details**: Comprehensive event information including name, description, address, date/time
- **Distance Indicators**: Shows distance badges when user location is available
- **Event Type Badges**: Color-coded event type indicators
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices

### Smart Sorting & Filtering
- **Location-Aware Sorting**: Sorts by distance when user location available, otherwise by chronological order
- **Event Type Filtering**: Pill-style filters for different event categories
- **Real-time Updates**: Filters apply immediately with smooth transitions
- **Distance Calculations**: Accurate distance display with proper formatting

### Pagination System
- **Load More Pattern**: Progressive loading to handle large event sets
- **Performance Optimized**: Loads 50 events initially, then additional pages on demand
- **Loading States**: Clear feedback during data loading
- **Progress Indicators**: Shows remaining event count and loading status

## 🔧 Technical Implementation

### Component Architecture

#### Main Components
- **`ListView.tsx`**: Main list view component with pagination and filtering
- **`EventTypeFilter.tsx`**: Event type filtering component
- **`LocationPermissionBanner.tsx`**: Location permission prompt component

#### Key Files
```
ui/src/routes/ListView.tsx              # Main list view component
ui/src/components/EventTypeFilter.tsx   # Event type filtering
ui/src/components/LocationPermissionBanner.tsx # Location permission UI
ui/src/hooks/useUserLocation.ts         # Location services
```

### Data Flow & State Management

#### Event Fetching Process
1. **Initial Load**: Fetches events for the next 90 days on component mount
2. **Location-Based API**: Uses user coordinates when available for better relevance
3. **Enhanced Coverage**: 200-mile radius (up from 50 miles) ensures users always see events
4. **Filtering**: Applies event type filters client-side for immediate response
5. **Sorting**: Sorts by distance (if location available) or chronologically
6. **Pagination**: Applies pagination to limit displayed events

#### State Management
```typescript
const [allEvents, setAllEvents] = useState<EventItem[]>([]);
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(true);
const [isLoadingMore, setIsLoadingMore] = useState(false);
```

### Sorting Logic

#### Location-Based API Usage
```typescript
// Enhanced API call with location parameters when available
if (coords) {
  // Use location-based browsing for better relevance
  apiParams = {
    lat: coords.lat,
    lng: coords.lng,
    radius: 321869 // 200 miles in meters (increased from 50 miles)
  };
} else {
  // Fallback to time-based browsing
  apiParams = { range: 90 };
}
```

#### Distance-Based Sorting (when location available)
```typescript
if (coords) {
  // Calculate distances and sort by proximity
  sortedEvents = filtered
    .filter(event => event.latitude != null && event.longitude != null)
    .map(event => ({
      ...event,
      distanceMeters: haversineMeters(
        coords.lat, coords.lng,
        Number(event.latitude), Number(event.longitude)
      )
    }))
    .sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));

  // Add events without coordinates at the end
  const eventsWithoutCoords = filtered.filter(event =>
    event.latitude == null || event.longitude == null
  );
  sortedEvents = [...sortedEvents, ...eventsWithoutCoords];
}
```

#### Chronological Sorting (fallback)
```typescript
sortedEvents = [...filtered].sort((a, b) => {
  const ta = a.startsAtUtc ? new Date(a.startsAtUtc).getTime() : 0;
  const tb = b.startsAtUtc ? new Date(b.startsAtUtc).getTime() : 0;
  return ta - tb;
});
```

## 🎛️ User Interface

### Event Cards
- **Compact Design**: Efficient use of space with clear information hierarchy
- **Interactive Elements**: Hover effects and click handling
- **Information Density**: Name, description, address, date/time, distance, event type
- **Visual Hierarchy**: Clear typography and spacing

### Filter Controls
- **Event Type Filter**: Consistent pill-style buttons matching other views
- **Real-time Application**: Instant filtering without page reload
- **State Persistence**: Filter selections maintained across navigation
- **Cross-View Consistency**: Same filtering experience as map and calendar views

### Location Integration
- **Permission Banner**: Prompts users to enable location for better sorting
- **Fallback UI**: Clear messaging when location access is denied
- **Graceful Degradation**: Works perfectly without location data

### Loading States
- **Initial Loading**: Simple "Loading…" message during data fetch
- **Load More Button**: Animated loading spinner during pagination
- **Empty States**: Helpful messages for no events or filtered results
- **Error Handling**: Graceful error recovery with retry options

## 📱 Responsive Design

### Desktop Experience
- **Full Information Display**: All event details visible in list format
- **Large Click Targets**: Comfortable interaction areas
- **Multi-column Layout**: Efficient use of screen real estate
- **Keyboard Navigation**: Full keyboard accessibility

### Mobile Experience
- **Touch Optimization**: Larger touch targets for mobile interaction
- **Readable Typography**: Appropriate font sizes for mobile screens
- **Vertical Layout**: Optimized for portrait orientation
- **Swipe-Friendly**: Smooth scrolling and touch interactions

### Tablet Experience
- **Balanced Layout**: Hybrid approach between desktop and mobile
- **Adaptive Spacing**: Appropriate padding and margins for tablet screens
- **Touch Navigation**: Optimized for tablet interaction patterns

## 🔍 Event Discovery

### Event Information Display
- **Event Name**: Prominent display with clear typography
- **Address**: Location information when available
- **Description**: Truncated description with line clamping
- **Date & Time**: Formatted date and time display
- **Distance**: Distance badge when location available
- **Event Type**: Color-coded event type badge

### Navigation & Interaction
- **Click to Navigate**: Entire event card is clickable for navigation
- **Hover Feedback**: Visual feedback on hover for better UX
- **Load More**: Progressive loading with clear call-to-action
- **Smooth Transitions**: Polished animations and state changes

## 📍 Location Services Integration

### Geolocation Support
- **Automatic Detection**: Seamless location detection on load
- **Location-Based API**: Uses user coordinates in API calls for better event relevance
- **Enhanced Coverage**: Increased from 50 to 200 miles to prevent empty results
- **Permission Handling**: Clear user experience for location requests
- **Fallback Behavior**: Works perfectly without location access
- **Privacy Respectful**: No forced location requirements

### Distance Display
- **Accurate Calculations**: Haversine formula for precise distance
- **Miles Formatting**: User-friendly distance display
- **Conditional Display**: Only shows when location is available
- **Performance Optimized**: Efficient distance calculations

## 🔧 Configuration & Customization

### Pagination Settings
```typescript
const eventsPerPage = 50; // Events loaded per page
const initialRange = 90;  // Days of events to fetch initially
const enhancedRadius = 321869; // 200 miles in meters (increased from 50 miles)
```

### Loading Behavior
- **Progressive Loading**: Loads additional events on demand
- **Loading Delay**: 300ms artificial delay for better UX
- **Batch Size**: 50 events per pagination batch
- **Memory Management**: Efficient state updates and cleanup

### Sorting Preferences
- **Primary Sort**: Distance when location available
- **Secondary Sort**: Chronological order as fallback
- **Coordinate Filtering**: Events without coordinates sorted last
- **Stable Sorting**: Consistent results across page loads

## 🐛 Error Handling

### Common Scenarios
- **Network Failures**: Graceful error handling with retry options
- **Empty Results**: Clear messaging for no events or filtered results
- **Location Denied**: Helpful guidance for enabling location services
- **API Errors**: User-friendly error messages with recovery suggestions

### Recovery Mechanisms
- **Automatic Retry**: Intelligent retry for transient failures
- **Manual Refresh**: User-initiated data refresh options
- **Fallback Sorting**: Works without location data
- **Error Boundaries**: Component-level error isolation

## 📊 Performance Considerations

### Optimization Features
- **Lazy Loading**: Events loaded progressively, not all at once
- **Efficient Filtering**: Client-side filtering for immediate response
- **Memory Management**: Proper cleanup of event listeners and data
- **Debounced Updates**: Optimized state updates for smooth interaction

### Performance Metrics
- **Initial Load**: Fast loading of first 50 events
- **Filter Response**: < 100ms filter application
- **Scroll Performance**: Smooth scrolling with large event sets
- **Memory Usage**: Efficient memory footprint for extended use

## 🔧 Developer Integration

### Component Usage
```tsx
import { ListView } from '@/routes/ListView';

function App() {
  return (
    <FilterProvider>
      <ListView />
    </FilterProvider>
  );
}
```

### Hook Integration
```tsx
import { useUserLocation } from '@/hooks/useUserLocation';

function CustomListComponent() {
  const { coords, status } = useUserLocation();

  // Use location data for sorting...
}
```

### Event Data Structure
```typescript
interface EventItem {
  id: string;
  name: string;
  description?: string;
  address?: string;
  startsAtUtc?: string;
  latitude?: number;
  longitude?: number;
  eventType?: string;
  distanceMeters?: number; // Calculated dynamically
}
```

## 🎯 Use Cases

### Primary Use Cases
- **Quick Scanning**: Users wanting to quickly browse through many events
- **Detail-Oriented**: Users who prefer reading detailed event information
- **Systematic Browsing**: Users who want to methodically explore all available events
- **Mobile Users**: Users on mobile devices preferring list over map navigation

### Complementary Views
- **Map View**: For geographical exploration and spatial relationships
- **Calendar View**: For time-based event planning and scheduling
- **List View**: For comprehensive event information and systematic browsing

---

*For technical implementation details, refer to the feature plan and review documents in `/docs/features/` directory.*
