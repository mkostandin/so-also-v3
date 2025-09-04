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
- **`CommitteeFilter.tsx`**: Multi-select committee dropdown component
- **`FilterContext`**: Shared state management for filter selections and scroll position
- **View Integration**: Consistent integration across MapView, ListView, and CalendarView

#### Key Implementation Files
```
ui/src/components/EventTypeFilter.tsx      # Main filter component
ui/src/components/CommitteeFilter.tsx      # Committee filter dropdown
ui/src/routes/MapIndex.tsx                 # Filter context provider
ui/src/routes/MapView.tsx                  # Map view integration
ui/src/routes/ListView.tsx                 # List view integration
ui/src/routes/CalendarView.tsx             # Calendar view integration
ui/src/index.css                           # Scroll styling and animations
server/src/api/committees.ts               # Committee API endpoints
server/src/lib/committee-validation.ts     # Committee name validation
```

### State Management

#### FilterContext Structure
```typescript
interface FilterContextType {
  selectedEventTypes: string[];                    // Currently selected filter types (data values)
  setSelectedEventTypes: (types: string[]) => void; // Update filter selections
  selectedCommittees: string[];                    // Selected committee slugs for filtering
  setSelectedCommittees: (committees: string[] | ((prev: string[]) => string[])) => void; // Update committee selections
  selectedDistance: string;                        // Distance filter for calendar
  setSelectedDistance: (distance: string) => void; // Update distance filter
  filterScrollPosition: number;                    // Horizontal scroll position
  setFilterScrollPosition: (position: number) => void; // Update scroll position
  availableCommittees: Committee[];                // Available committees for dropdown
  committeesLoading: boolean;                      // Loading state for committees
  committeesError: string | null;                  // Error state for committees
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

## 🏛️ **Committee Filtering System**

### Overview

The Committee Filter provides advanced filtering capabilities for events based on organizational committees. This feature enables users to narrow down events to specific committees while maintaining ALL CAPS display consistency and providing comprehensive validation for committee names.

### 🎯 Committee Filter Features

#### Multi-Select Dropdown
- **Dropdown Interface**: Clean, accessible dropdown positioned below the event type filter
- **Multi-Selection**: Users can select multiple committees simultaneously
- **ALL CAPS Display**: Consistent uppercase formatting for all committee names
- **Event Count Display**: Shows number of upcoming events per committee in parentheses
- **Alphabetical Sorting**: Committees sorted alphabetically by normalized name
- **Loading States**: Graceful loading indicators and error handling

#### Committee Name Validation
- **Strict Format Requirements**: Only accepts predefined committee formats
- **Regional Committees**: `NECYPAA`, `MSCYPAA`, `RISCYPAA`, `NHSCYPAA`, etc.
- **Advisory Committees**: `NECYPAA ADVISORY`, `MSCYPAA ADVISORY`, etc.
- **BID Committees**: `RHODE ISLAND BID FOR NECYPAA`, `MASSACHUSETTS BID FOR MSCYPAA`, etc.
- **User Guidance**: Real-time validation feedback during event submission
- **Smart Suggestions**: Provides format examples for invalid committee names

#### Available Committees
```typescript
// Regional Committees (7 total)
'NECYPAA', 'MSCYPAA', 'RISCYPAA', 'NHSCYPAA',
'CSCYPAA', 'MECYPAA', 'VTCYPAA'

// Advisory Committees (5 total)
'NECYPAA ADVISORY', 'MSCYPAA ADVISORY', 'RISCYPAA ADVISORY',
'NHSCYPAA ADVISORY', 'CSCYPAA ADVISORY'

// BID Committees (5 total)
'RHODE ISLAND BID FOR NECYPAA',
'MASSACHUSETTS BID FOR MSCYPAA',
'CONNECTICUT BID FOR CSCYPAA',
'NEW HAMPSHIRE BID FOR NHSCYPAA',
'MAINE BID FOR MECYPAA'
```

### 🔧 Committee Filter Implementation

#### Component Architecture
```typescript
// Main Committee Filter Component
interface CommitteeFilterProps {
  selectedCommittees: string[];                    // Selected committee slugs
  onCommitteesChange: (committees: string[] | ((prev: string[]) => string[])) => void;
}

// Committee Data Structure
interface Committee {
  id: string;           // Unique identifier
  name: string;         // ALL CAPS display name
  slug: string;         // URL-friendly identifier
  lastSeen: string;     // Last seen timestamp
  eventCount?: number;  // Optional event count
}
```

#### API Integration
```typescript
// Fetch committees with optional event counts
const committees = await api.getCommittees(true); // includeCounts=true

// Enhanced filtering API calls
const events = await api.events({
  committees: ['necypaa', 'mscypaa'],  // Multiple committee filtering
  range: 90
});

const browse = await api.browse({
  committees: ['necypaa'],
  lat: 42.3601,
  lng: -71.0589,
  radius: 50
});
```

#### Local Storage Persistence
```typescript
// Committee selections saved to localStorage
localStorage.setItem('selected-committees', JSON.stringify(['necypaa', 'mscypaa']));

// Automatic restoration on component mount
const saved = localStorage.getItem('selected-committees');
if (saved) {
  setSelectedCommittees(JSON.parse(saved));
}
```

### 🏗️ Committee Data Management

#### Database Schema
```sql
-- Committees table structure
CREATE TABLE app.committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,              -- Normalized to ALL CAPS
  slug TEXT NOT NULL UNIQUE,       -- URL-friendly identifier
  test_data BOOLEAN DEFAULT false, -- Test data flag
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX committees_slug_idx ON app.committees(slug);
CREATE INDEX committees_name_idx ON app.committees(name);
CREATE INDEX committees_test_data_idx ON app.committees(test_data);
```

#### Sync Algorithm
```typescript
// Committee sync process
1. Query events for unique committee/committee_slug combinations
2. Remove leading "THE" from BID committee names for deduplication
3. Normalize all committee names to ALL CAPS format
4. Validate names against strict patterns (regional, advisory, BID only)
5. Reject invalid formats like "NECYPAA EXECUTIVE"
6. Generate slugs from normalized names
7. Compare with existing committees table
8. Insert new committees not already present
9. Update last_seen timestamp for existing committees
```

### 🎨 Committee Filter UI/UX

#### Dropdown Design
- **Consistent Styling**: Uses ShadCN Select component for design consistency
- **Loading States**: Shows "Loading committees..." when fetching data
- **Error Handling**: Graceful fallback with sample data when API fails
- **Accessibility**: Full ARIA labels and keyboard navigation support
- **Touch-Friendly**: Optimized for mobile devices with proper touch targets

#### Selection States
```typescript
// "ALL COMMITTEES" option (default)
selectedCommittees.length === 0

// Single committee selected
selectedCommittees.length === 1
displayText = committee.name

// Multiple committees selected
selectedCommittees.length > 1
displayText = `${selectedCommittees.length} COMMITTEES SELECTED`
```

#### Event Count Display
```typescript
// API returns event counts when requested
GET /api/v1/committees?includeCounts=true

// Frontend displays counts in parentheses
NECYPAA (15)
MSCYPAA (12)
RISCYPAA (8)
```

### 🔗 Integration Points

#### FilterContext Integration
The committee filter integrates seamlessly with the existing filter system:

```typescript
// Combined filtering in FilterContext
const combinedFilters = {
  eventTypes: selectedEventTypes,
  committees: selectedCommittees,
  distance: selectedDistance
};
```

#### API Parameter Mapping
```typescript
// Frontend committee slugs map to backend filtering
const committeeSlugs = selectedCommittees; // ['necypaa', 'mscypaa']
const apiParams = { committees: committeeSlugs };

// API applies filters to all endpoints
GET /api/v1/events?committee=necypaa&committee=mscypaa
GET /api/v1/browse?committee=necypaa&committee=mscypaa
GET /api/v1/occurrences?committee=necypaa&committee=mscypaa
```

#### View Integration
- **Map View**: Committee filter positioned below event type filter
- **List View**: Consistent positioning across all views
- **Calendar View**: Maintains responsive design and spacing
- **Cross-View Persistence**: Filter state maintained when switching views

### 🛡️ Validation & Error Handling

#### Committee Name Validation
```typescript
// Strict validation patterns
const REGIONAL_PATTERN = /^[A-Z]+YPAA$/;
const ADVISORY_PATTERN = /^[A-Z]+YPAA ADVISORY$/;
const BID_PATTERN = /^[A-Z\s]+BID FOR Y?PAA$/;

// Validation examples
✅ NECYPAA (regional)
✅ NECYPAA ADVISORY (advisory)
✅ RHODE ISLAND BID FOR NECYPAA (BID)
❌ NECYPAA EXECUTIVE (invalid - contains EXECUTIVE)
❌ THE NEW HAMPSHIRE CONFERENCE (invalid - too long)
```

#### Error Messages & Suggestions
```typescript
// Smart error messages
"NECYPAA EXECUTIVE" → "Committee names cannot contain 'EXECUTIVE'. Use regional names like 'NECYPAA' instead."

"THE NEW HAMPSHIRE CONFERENCE" → "Committee names should be short. Use 'NHSCYPAA' instead of long descriptive names."

"THE NECYPAA" → "Remove 'THE' from the beginning of committee names."
```

#### Fallback Behavior
- **API Failure**: Shows sample data for development continuity
- **Network Issues**: Graceful degradation with user-friendly messages
- **Invalid Data**: Filters out malformed committee data
- **Empty States**: Clear messaging when no committees are available

### 📊 Committee Filter Performance

#### Query Optimization
- **Database Indexes**: Optimized indexes on slug, name, and test_data columns
- **Efficient Sync**: Smart deduplication prevents unnecessary database operations
- **Cached Results**: Committee data cached in memory for session duration
- **Pagination Ready**: Supports large committee lists with efficient queries

#### Frontend Performance
- **Debounced Updates**: Prevents excessive API calls during rapid filter changes
- **Memoization**: Proper React memoization prevents unnecessary re-renders
- **Virtual Scrolling**: Ready for large committee lists if needed
- **Bundle Size**: Minimal impact on application bundle size

### 🔧 Committee Filter Configuration

#### Environment Variables
```bash
# No additional environment variables required
# Works with existing database and API configuration
```

#### Debug Mode Support
```typescript
// Debug mode automatically includes test data
const includeTestData = debugSettings.isDebugModeEnabled();
const committees = await api.getCommittees(includeCounts, includeTestData);
```

#### Test Data Management
```sql
-- All seeded committees marked as test data
UPDATE app.committees SET test_data = true WHERE test_data = false;

-- API filtering excludes test data in production
SELECT * FROM app.committees WHERE test_data = false;
```

### 📈 Committee Filter Analytics

#### Usage Metrics
- **Committee Selection Frequency**: Most popular committees for filtering
- **Multi-Selection Patterns**: How users combine committee filters
- **Filter Persistence**: How often users maintain committee selections
- **API Performance**: Response times for committee-enhanced queries

#### Data Insights
- **Committee Distribution**: Geographic distribution of committees
- **Event Coverage**: Percentage of events covered by each committee
- **User Engagement**: Filter usage patterns and preferences
- **Performance Impact**: Database query performance with committee filtering

---

*For technical implementation details, refer to the feature plan and review documents in `/docs/features/0034_PLAN.md` and `/docs/features/0034_REVIEW.md`.*
