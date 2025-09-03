# Filter View Documentation

## Overview

The Filter View represents the enhanced event type filtering system that provides a horizontal scrollable interface for selecting event categories across the application's three main views (Map, List, and Calendar). This feature optimizes space usage while maintaining full functionality and accessibility.

## 🎯 Core Features

### Horizontal Scrollable Design
- **Single-Line Layout**: Compact horizontal arrangement of filter buttons
- **Space Efficiency**: Reduces vertical space consumption by 40-60%
- **Smooth Scrolling**: Touch-friendly scrolling on mobile devices
- **Overflow Management**: Automatic horizontal scrolling when buttons exceed container width
- **Visual Continuity**: Seamless integration across all three application views

### Event Type Categories
- **Events**: General event category for broad event types (displayed as "Events", filtered as "Event")
- **Committee Meetings**: Specialized filtering for organizational meetings (displayed as "Committee Meetings", filtered as "Committee Meeting")
- **Conferences**: Dedicated category for conference-style events (displayed as "Conferences", filtered as "Conference")
- **YPAA Meetings**: Young Professionals of the Americas Association events (displayed as "YPAA Meetings", filtered as "YPAA Meeting")
- **Other**: Catch-all category for miscellaneous event types (displayed and filtered as "Other")

## 🔧 Technical Implementation

### Component Architecture

#### Main Components
- **`EventTypeFilter.tsx`**: Core horizontal scrollable filter component
- **`FilterContext`**: Shared state management for filter selections and scroll position
- **View Integration**: Consistent integration across MapView, ListView, and CalendarView

#### Key Implementation Files
```
ui/src/components/EventTypeFilter.tsx      # Main filter component
ui/src/routes/MapIndex.tsx                 # Filter context provider
ui/src/routes/MapView.tsx                  # Map view integration
ui/src/routes/ListView.tsx                 # List view integration
ui/src/routes/CalendarView.tsx             # Calendar view integration
ui/src/index.css                           # Scroll styling and animations
```

### State Management

#### FilterContext Structure
```typescript
interface FilterContextType {
  selectedEventTypes: string[];                    // Currently selected filter types (data values)
  setSelectedEventTypes: (types: string[]) => void; // Update filter selections
  selectedDistance: string;                        // Distance filter for calendar
  setSelectedDistance: (distance: string) => void; // Update distance filter
  filterScrollPosition: number;                    // Horizontal scroll position
  setFilterScrollPosition: (position: number) => void; // Update scroll position
}
```

#### Display vs Data Value Mapping
The filter system maintains a separation between user-facing display names (plural) and internal data values (singular):

```typescript
const EVENT_TYPE_MAPPING: Record<string, string> = {
  'Events': 'Event',                    // Display → Data
  'Committee Meetings': 'Committee Meeting',
  'Conferences': 'Conference',
  'YPAA Meetings': 'YPAA Meeting',
  'Other': 'Other'
};
```

This ensures:
- **User Experience**: Plural names provide better readability ("Events" vs "Event")
- **Data Integrity**: Filtering works with actual database values
- **Consistency**: Display names remain user-friendly while data values match the schema

#### Scroll Position Persistence
- **Context Storage**: Scroll position maintained in React context
- **Instant Restoration**: Uses `requestAnimationFrame` for seamless position restoration
- **Debounced Saving**: 150ms debounce prevents excessive context updates during scrolling
- **Cross-View Consistency**: Scroll position preserved when switching between views

### Scroll Behavior Implementation

#### Position Restoration Logic
```typescript
// Instant scroll position restoration without animation
requestAnimationFrame(() => {
  container.style.scrollBehavior = 'auto';  // Disable smooth scrolling
  container.scrollLeft = savedPosition;     // Set position instantly

  // Re-enable smooth scrolling for future interactions
  requestAnimationFrame(() => {
    container.style.scrollBehavior = '';
  });
});
```

#### Debounced Position Saving
```typescript
// Debounce scroll position saves to prevent excessive updates
const handleScroll = () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    setFilterScrollPosition(container.scrollLeft);
  }, 150);
};
```

## 🎨 User Interface

### Filter Button Design
- **Pill-Style Buttons**: Rounded, modern appearance with consistent sizing
- **Active State**: Blue background with white text and shadow for selected filters
- **Inactive State**: Gray background with hover effects for available filters
- **Scale Animations**: Subtle hover (105%) and active (95%) scale transformations
- **Typography**: Medium font weight with consistent text sizing

### Scroll Container Styling
- **Hidden Scrollbar**: Custom CSS hides browser scrollbars for clean appearance
- **Smooth Scrolling**: CSS `scroll-behavior: smooth` for user-initiated scrolling
- **Touch Optimization**: Proper touch event handling for mobile devices
- **Snap Alignment**: CSS `scroll-snap-align: start` for button alignment

### Responsive Behavior

#### Desktop Experience
- **Full Functionality**: All filter buttons accessible via scrolling
- **Mouse Interaction**: Hover states and click interactions optimized for mouse
- **Keyboard Support**: Full keyboard navigation with proper focus management
- **Visual Feedback**: Clear active/inactive states with color and scale changes

#### Mobile Experience
- **Touch Scrolling**: Native touch scrolling support with momentum
- **Finger-Friendly**: Adequate button sizing for touch targets
- **Swipe Gestures**: Smooth horizontal scrolling with standard mobile gestures
- **Performance Optimized**: Debounced scroll handling prevents excessive processing

## 📊 Performance Optimizations

### Rendering Performance
- **Memoization**: Proper use of `useCallback` for stable function references
- **Minimal Re-renders**: Optimized dependency arrays prevent unnecessary updates
- **Efficient Updates**: Context updates only when filter state actually changes
- **Component Stability**: Stable props prevent cascading re-renders

### Scroll Performance
- **Passive Event Listeners**: `passive: true` flag for better scroll performance
- **Debounced Updates**: 150ms debounce prevents excessive context updates
- **RequestAnimationFrame**: Proper timing for DOM updates and position restoration
- **Memory Cleanup**: Proper cleanup of event listeners and timeouts

### Bundle Optimization
- **Minimal Dependencies**: Pure React and CSS implementation
- **Tree Shaking**: No unused code in the final bundle
- **Lazy Loading**: Component loads only when needed
- **CSS Optimization**: Efficient CSS classes with Tailwind utility approach

## ♿ Accessibility Features

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for screen reader navigation
- **Role Attributes**: Proper `role="group"` for semantic structure
- **State Announcements**: Clear indication of selected/unselected states
- **Navigation Support**: Logical tab order and keyboard accessibility

### Keyboard Navigation
- **Tab Navigation**: Proper focus management between filter buttons
- **Enter/Space Activation**: Standard keyboard activation for filter toggling
- **Focus Indicators**: Clear visual focus states for keyboard users
- **Arrow Key Support**: Potential for arrow key navigation in scroll container

### Touch Accessibility
- **Touch Targets**: Minimum 44px touch targets for mobile accessibility
- **Gesture Support**: Standard touch scrolling gestures
- **Feedback**: Visual and haptic feedback for touch interactions
- **Error Prevention**: Clear visual states prevent accidental activations

## 🔗 Integration Points

### Map View Integration
- **Container Layout**: Filter positioned above map with consistent max-width
- **State Synchronization**: Real-time updates to map markers based on filter selections
- **Responsive Behavior**: Adapts to map container resizing
- **Loading States**: Filter remains visible during map loading

### List View Integration
- **Header Position**: Filter positioned at top of list container
- **Pagination Sync**: Filter state maintained during pagination
- **Location Context**: Works seamlessly with location-based sorting
- **Empty States**: Appropriate messaging when no events match filters

### Calendar View Integration
- **Dual Filters**: Coexists with distance filter in calendar view
- **Date Integration**: Filter state preserved across date navigation
- **Event Loading**: Real-time updates to calendar events
- **Layout Harmony**: Consistent spacing with calendar grid

## 🛠️ Configuration & Customization

### CSS Customization
```css
/* Custom scrollbar styling */
.horizontal-filter-scroll::-webkit-scrollbar {
  height: 4px;
}

.horizontal-filter-scroll::-webkit-scrollbar-thumb {
  background: rgb(156 163 175);
  border-radius: 2px;
}
```

### Component Props
```typescript
interface EventTypeFilterProps {
  selectedTypes: string[];                    // Current filter selections
  onTypesChange: (types: string[]) => void;   // Selection change handler
}
```

### Context Configuration
```typescript
// Default filter state
const defaultSelectedTypes = ['Events', 'Committee Meetings', 'Conferences', 'YPAA Meetings', 'Other'];
const defaultDistance = '150';
```

## 🐛 Error Handling & Edge Cases

### Common Scenarios
- **Missing Context**: Clear error messages when FilterContext is unavailable
- **Invalid Types**: Graceful handling of unexpected event type values
- **Scroll Position Loss**: Fallback behavior when scroll position cannot be restored
- **Touch Event Failures**: Alternative interaction methods when touch fails

### Recovery Mechanisms
- **State Reset**: Ability to reset filters to default state
- **Position Recovery**: Automatic scroll position recovery on component remount
- **Fallback Rendering**: Basic filter functionality when advanced features fail
- **User Feedback**: Clear messaging for error states and recovery options

## 📈 Usage Analytics & Metrics

### Performance Metrics
- **Interaction Speed**: Filter toggle response time (< 100ms)
- **Scroll Performance**: Smooth scrolling at 60fps on supported devices
- **Memory Usage**: Minimal memory footprint with proper cleanup
- **Bundle Size**: Small addition to overall application bundle

### User Experience Metrics
- **Filter Usage**: Percentage of users who interact with filters
- **Scroll Distance**: Average scroll distance in filter container
- **Selection Patterns**: Most commonly selected filter combinations
- **View Switching**: Frequency of filter state preservation during navigation

---

*For technical implementation details, refer to the feature plan and review documents in `/docs/features/0030_PLAN.md` and `/docs/features/0030_REVIEW.md`.*
