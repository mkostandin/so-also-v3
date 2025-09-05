# Map View Documentation

## Overview

The Map View is a core feature of the application that provides an interactive Mapbox GL-based map interface for visualizing events geographically. It integrates with the application's event data, user location services, and filtering system to provide a comprehensive event discovery experience.

## 🗺️ Core Features

### Mapbox GL Integration
- **Full-Featured Map**: Powered by Mapbox GL JS with smooth zooming, panning, and interaction
- **Custom Styling**: Branded map design with appropriate controls and attribution
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices with consistent max-width (`max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl`)
- **Performance Optimized**: Efficient rendering with proper memory management

### Event Visualization
- **Custom Markers**: Different visual styles for different event types:
  - Events: Standard marker styling
  - Committee Meetings: Distinctive marker design
  - Conferences: Specialized conference markers
  - Other event types: Appropriate marker variations

- **Clustering**: Automatic marker grouping at lower zoom levels
  - Reduces visual clutter in dense areas
  - Shows cluster count for grouped events
  - Expands to individual markers when zoomed in

- **Interactive Markers**: Click any marker to view event details
  - Popup with event information
  - Links to full event details
  - Smooth animations and transitions

### User Location Integration
- **Real-time Location**: User's current location displayed on map
- **Accuracy Circle**: Visual representation of location accuracy
- **Geolocation Controls**: Button to center map on user location
- **Permission Handling**: Graceful handling of location permissions

## 🔧 Technical Implementation

### Component Architecture

#### Main Components
- **`MapboxMap.tsx`**: Main map component handling initialization and rendering
- **`useMapboxMap.ts`**: Custom hook managing map lifecycle and state
- **`mapbox.ts`**: Utility functions for map configuration and styling

#### Key Files
```
ui/src/components/MapboxMap.tsx      # Main map component
ui/src/hooks/useMapboxMap.ts         # Map lifecycle management
ui/src/lib/mapbox.ts                 # Map utilities and configuration
ui/src/routes/MapView.tsx            # Route wrapper with loading/error states
```

### Map Initialization Process

1. **Environment Validation**: Checks for valid Mapbox access token
2. **Container Setup**: Creates map container with proper dimensions
3. **Mapbox Instance**: Initializes Mapbox GL map with configuration
4. **Event Listeners**: Sets up map event handlers
5. **Data Loading**: Fetches and displays event markers
6. **User Location**: Adds user location marker if available

### Event Data Integration

#### Data Flow
1. **API Fetching**: Calls `/api/v1/browse` endpoint with location, event type, and committee filter parameters
2. **Data Processing**: Converts event data to map markers
3. **Marker Creation**: Creates Mapbox markers with custom styling
4. **Clustering Setup**: Configures marker clustering for performance
5. **Committee Filtering**: Applies selected committee filters to displayed markers

#### Marker Styling
```typescript
// Example marker creation
const marker = new mapboxgl.Marker({
  color: getEventTypeColor(event.type),
  scale: 0.8
})
.setLngLat([event.longitude, event.latitude])
.addTo(map);
```

### Performance Optimizations

#### Loading Strategy
- **Progressive Loading**: Map loads first, then event data
- **Lazy Initialization**: Map only initializes when container is visible
- **Error Recovery**: Intelligent retry logic for failed loads
- **Memory Cleanup**: Proper disposal of map instances

#### Rendering Optimization
- **Clustering**: Reduces DOM nodes at lower zoom levels
- **Efficient Updates**: Minimal re-renders during filter changes
- **Debounced Events**: Throttled event handlers for smooth interaction
- **Resource Management**: Cleanup of event listeners and markers

## 🎛️ User Interface

### Map Controls
- **Zoom Controls**: Standard zoom in/out buttons
- **Compass**: North orientation indicator
- **Geolocation**: Center on user location button
- **Attribution**: Mapbox attribution with clean styling

### Filter Integration
- **Event Type Filter**: Pill-style buttons above map
- **Committee Filter**: Multi-select dropdown for filtering events by specific committees
- **Universal Committee Filtering**: Committee selections now apply to map markers in real-time
- **Real-time Updates**: Markers update immediately when filters change
- **State Persistence**: Filter selections maintained across navigation
- **Cross-View Consistency**: Same filters work in calendar and list views

### Loading States
- **Skeleton Loading**: Professional loading indicators during initialization
- **Progress Feedback**: Clear indication of loading progress
- **Error States**: User-friendly error messages with retry options
- **Fallback UI**: Alternative interface when map fails to load

## 📱 Responsive Design

### Desktop Experience
- **Full Feature Set**: All controls and features available
- **Large Map Area**: Maximized map viewport for detailed exploration
- **Multi-panel Layout**: Filters alongside map for efficient use of space

### Mobile Experience
- **Touch Optimization**: Large touch targets and swipe gestures
- **Simplified Controls**: Essential controls prioritized
- **Vertical Layout**: Filters above map, optimized for portrait orientation
- **Performance Tuning**: Reduced clustering and simplified rendering

### Tablet Experience
- **Hybrid Layout**: Combination of desktop and mobile optimizations
- **Adaptive Controls**: Context-aware control positioning
- **Flexible Sizing**: Responsive to different tablet orientations

## 🔍 Event Discovery

### Marker Interactions
- **Click to View**: Click any marker to see event details
- **Popup Display**: Rich popup with event information
- **Navigation Links**: Direct links to full event pages
- **Accessibility**: Keyboard navigation and screen reader support

### Clustering Behavior
- **Zoom-Based**: Clusters expand as user zooms in
- **Count Display**: Shows number of events in each cluster
- **Smooth Transitions**: Animated cluster expansion/contraction
- **Performance Aware**: Clustering reduces load on lower-performance devices

## 🛠️ Configuration

### Environment Variables
```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

### Map Configuration
- **Style**: Mapbox Streets style with custom theming
- **Controls**: Essential controls only for clean interface
- **Clustering**: Configurable clustering parameters
- **Performance**: Optimized settings for smooth interaction

## 🐛 Error Handling

### Common Scenarios
- **Missing Token**: Clear setup instructions with error message
- **Network Issues**: Retry logic with exponential backoff
- **Geolocation Denied**: Graceful degradation without location features
- **API Failures**: Fallback to cached data or offline mode

### Recovery Mechanisms
- **Automatic Retry**: Intelligent retry for transient failures
- **User Options**: Manual retry buttons for user-initiated recovery
- **Fallback UI**: Alternative interfaces when map unavailable
- **Error Reporting**: User-friendly error messages with actionable guidance

## 🔧 Developer Integration

### Component Usage
```tsx
import { MapboxMap } from '@/components/MapboxMap';

function MapView() {
  return (
    <MapboxMap
      onReady={() => console.log('Map ready')}
      onError={(error) => console.error('Map error:', error)}
      onMarkerClick={(event) => showEventDetails(event)}
    />
  );
}
```

### Custom Hook Usage
```tsx
import { useMapboxMap } from '@/hooks/useMapboxMap';

function CustomMapComponent() {
  const { map, loading, error } = useMapboxMap({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/streets-v11'
  });

  // Use map instance...
}
```

### Event Data Format
```typescript
interface EventMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: EventType;
  startDate: string;
  // ... other event properties
}
```

## 📊 Performance Metrics

### Loading Performance
- **Initial Load**: < 2 seconds on modern connections
- **Marker Rendering**: Efficient rendering of up to 1000+ markers
- **Interaction Response**: < 100ms response to user interactions
- **Memory Usage**: Optimized memory footprint

### Optimization Features
- **Lazy Loading**: Components load only when needed
- **Code Splitting**: Map code separated from main bundle
- **Caching**: Efficient caching of map tiles and data
- **Cleanup**: Proper resource disposal to prevent memory leaks

---

*For technical implementation details, refer to the feature plan and review documents in `/docs/features/0001_PLAN.md` and `/docs/features/0001_REVIEW.md`.*
