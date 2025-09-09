# List View Documentation

## Overview

The List View provides a scrollable, paginated list interface for browsing events in chronological or distance-based order. It offers a clean, text-focused alternative to the map and calendar views, optimized for users who prefer reading through event details systematically. The view includes committee tags for organizational context and enhanced distance badges with location icons for improved visual hierarchy.

## 📋 Core Features

### Event List Display
- **Scrollable List**: Clean, card-based event listing with hover effects
- **Event Details**: Comprehensive event information including name, description, date/time
- **Distance Indicators**: Enhanced distance badges with location icons when user location is available
- **Event Type Badges**: Color-coded event type indicators
- **Committee Tags**: Truncated committee name badges with lighter blue styling for visual differentiation
- **Full-Height Layout**: Utilizes complete viewport height for maximum content visibility
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices with consistent max-width (`max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl`)

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
- **`EventListSkeleton.tsx`**: Skeleton loading component with animated placeholders
- **`EventTypeFilter.tsx`**: Event type filtering component
- **`LocationPermissionBanner.tsx`**: Location permission prompt component

#### Key Files
```
ui/src/routes/ListView.tsx              # Main list view component (full-height layout)
ui/src/routes/MapIndex.tsx              # Parent layout component (height management)
ui/src/components/EventListSkeleton.tsx # Skeleton loading component
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

### Layout & Responsive Design

#### Full-Height Layout & Sticky Filters
```tsx
// ListView renders under MapIndex, which is the single scroll owner.
// Filters are sticky under the tabs; content does not define its own scroller.
<div className="mx-auto max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-full flex flex-col min-h-0">
  {/* Sticky filters (match Map/Calendar) */}
  <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 space-y-2 border-b">
    <EventTypeFilter ... />
    <CommitteeFilter ... />
  </div>

  {/* Content relies on parent scroller (MapIndex) */}
  <div className="flex-1 min-h-0">
    {/* Event list content */}
  </div>
</div>
```

#### Responsive Width Handling
- **Mobile**: `max-w-full` - Uses full available width for better mobile experience
- **Small screens**: `sm:max-w-2xl` - Balanced width for small tablets
- **Medium screens**: `md:max-w-3xl` - Standard desktop width
- **Large screens**: `lg:max-w-4xl` - Wider layout for large displays

#### Mobile-Specific Padding
```tsx
// Mobile-specific padding to prevent content cutoff behind fixed filters
// pt-[16px] provides extra 16px spacing on mobile for better UX
// sm:pt-0 md:pt-0 removes padding on larger screens (container handles spacing)
<div className="mx-auto max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-full flex flex-col min-h-0 pt-[16px] sm:pt-0 md:pt-0">
  {/* List content with mobile-optimized spacing */}
</div>
```

#### Title Container Spacing
```typescript
// Proper horizontal padding for visual balance
<div className="flex items-center justify-between px-4">
  <h3 className="text-lg font-semibold">
    {coords ? 'Events by Distance' : 'Upcoming Events'}
  </h3>
</div>
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
- **Skeleton Loading**: Animated placeholder components with event structure during data fetch
- **Load More Button**: Skeleton button state during pagination loading
- **Empty States**: Helpful messages for no events or filtered results
- **Error Handling**: Graceful error recovery with retry options
- **Flash Prevention**: Multi-layer solution preventing content flashes during view/filter changes

### Skeleton Loading Implementation

#### EventListSkeleton Component
The `EventListSkeleton` component provides animated placeholder boxes that match the actual event item structure, creating a smooth loading experience:

```tsx
// Skeleton structure matching real event layout
<div className="p-3 border-b animate-pulse">
  <div className="flex items-center justify-between">
    <div className="flex-1 space-y-2">
      {/* Event title skeleton */}
      <Skeleton className="h-4 w-3/4" />
      {/* Event address skeleton */}
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
</div>
```

#### Skeleton State Management
```tsx
// In ListView.tsx - manages skeleton visibility
const [showSkeleton, setShowSkeleton] = useState(true);

// Show skeleton during loading or filtering operations
{eventsLoading || isRefiltering ? (
  <EventListSkeleton />
) : displayedEvents.length === 0 ? (
  <EmptyState />
) : (
  <EventList />
)}
```

#### Flash Prevention Strategy
- **Multi-layer approach**: Context data clearing, enhanced refiltering state, and proper timing
- **Race condition prevention**: Single useEffect prevents conflicting fetch operations
- **RequestAnimationFrame timing**: Ensures state updates happen after render cycle
- **Location fallback handling**: Manages coordinate changes and permission state transitions

## 📱 Responsive Design

### Desktop Experience
- **Full Information Display**: All event details visible in list format
- **Large Click Targets**: Comfortable interaction areas
- **Multi-column Layout**: Efficient use of screen real estate
- **Keyboard Navigation**: Full keyboard accessibility

### Mobile Experience
- **Mobile-Specific Spacing**: 104px top padding (16px extra for mobile UX) prevents content cutoff behind fixed filters
- **Load More Clearance**: 44px bottom padding ensures Load More button isn't obscured by bottom navigation tabs
- **Touch Optimization**: 44px minimum touch targets with hardware acceleration for smooth interactions
- **Full-Width Layout**: `max-w-full` utilizes complete screen width for better mobile experience
- **WebKit Compatibility**: Safari/iOS-specific viewport fixes using `-webkit-fill-available` and `-webkit-overflow-scrolling: touch`
- **Safe Area Support**: CSS environment variables handle notched devices (iPhone X+)
- **Readable Typography**: Appropriate font sizes for mobile screens
- **Vertical Layout**: Optimized for portrait orientation
- **Swipe-Friendly**: Smooth scrolling and touch interactions with `scroll-touch` and `scroll-pan-y` classes

### Tablet Experience
- **Balanced Layout**: Hybrid approach between desktop and mobile
- **Adaptive Spacing**: Appropriate padding and margins for tablet screens
- **Touch Navigation**: Optimized for tablet interaction patterns

## 🔍 Event Discovery

### Event Information Display
- **Event Name**: Prominent display with clear typography
- **Description**: Truncated description with line clamping
- **Date & Time**: Formatted date and time display
- **Distance**: Enhanced distance badge with location icon when available
- **Event Type**: Color-coded event type badge
- **Committee**: Truncated committee name badge with lighter blue styling for visual differentiation

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
- **Enhanced Visual Design**: Location pin icon for improved visual clarity

### Committee Tag Display
- **Truncated Text**: Committee names longer than 15 characters are truncated with ellipsis
- **Lighter Blue Styling**: 50% opacity blue background for subtle visual differentiation from event type badges
- **Responsive Layout**: Positioned below distance and event type badges in the right flex container
- **Conditional Rendering**: Only displays when committee data is available
- **Overflow Protection**: `max-w-[120px]` and `truncate` classes prevent layout issues

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
