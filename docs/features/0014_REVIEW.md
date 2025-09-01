# Feature 0014 Code Review: Fix Map Default Location

## Executive Summary
The plan was **partially implemented** but contains a **critical timing bug** that prevents the user's location from being prioritized over the Derry, NH fallback. The issue is that geolocation is asynchronous, but the map centering logic only runs once during map load.

## Plan Implementation Status ✅

### ✅ Completed Successfully
- Fallback coordinates updated from San Francisco `[-122.4194, 37.7749]` to Derry, NH `[-71.3273, 42.8806]`
- Zoom level increased from 10 to 13 for better city detail
- Code changes match the plan exactly
- No linting errors introduced
- Comment updated to reflect new location

### ❌ Critical Bug Identified
**Issue**: Map always loads to Derry, NH first, even when user location is available

**Root Cause**: Timing issue between map initialization and geolocation completion

**Technical Details**:
- `handleMapLoad` callback executes immediately when map loads
- At this point, `userCoords` is `null` (geolocation is asynchronous)
- Map centers on Derry, NH fallback coordinates
- Later when `userCoords` becomes available, there's no mechanism to recenter the map

## Code Analysis

### Current Implementation Flow
```typescript
// Map loads → handleMapLoad called immediately
if (userCoords) {           // userCoords is null at map load time
  map.setCenter([userCoords.lng, userCoords.lat]);
  map.setZoom(12);
} else {                    // Always hits this branch
  map.setCenter([-71.3273, 42.8806]); // Derry, NH
  map.setZoom(13);
}
```

### Missing Logic
No `useEffect` to handle when `userCoords` becomes available after map load:
```typescript
// This effect is MISSING from the current implementation
useEffect(() => {
  if (!map || !userCoords) return;
  map.setCenter([userCoords.lng, userCoords.lat]);
  map.setZoom(12);
}, [map, userCoords]);
```

## Proposed Solution

### Required Changes
Add a new `useEffect` hook to handle location updates after map load:

```typescript
// Add this useEffect after line 542
useEffect(() => {
  if (!map || !userCoords) return;

  // Center map on user's location when it becomes available
  map.setCenter([userCoords.lng, userCoords.lat]);
  map.setZoom(12);
}, [map, userCoords]);
```

### Implementation Notes
- This effect should be placed after the existing user marker effect (around line 567)
- The effect will automatically recenter the map when location becomes available
- Preserves the existing fallback behavior for when location is denied/unavailable
- Maintains the zoom level 12 for user location (as specified in plan)

## Impact Assessment

### Risk Level: **LOW**
- Adding the missing `useEffect` is a safe, minimal change
- No breaking changes to existing functionality
- Backward compatible with current implementation

### Testing Requirements
1. **Location enabled**: Verify map initially loads at Derry, NH, then recenters to user location
2. **Location disabled**: Verify map loads directly to Derry, NH
3. **Location denied**: Verify map loads directly to Derry, NH
4. **Performance**: Ensure no infinite re-rendering or excessive API calls

## Data Alignment Issues
None identified. The coordinate system and data structures are consistent throughout the codebase.

## Style Consistency
✅ Code style matches existing patterns in the component
✅ Comments are clear and descriptive
✅ Function naming follows established conventions

## Refactoring Recommendations
None required. The component size and complexity are within acceptable limits.

## Conclusion
The plan implementation is 90% complete but missing a critical piece for handling asynchronous geolocation. The fix is straightforward and should be implemented immediately to resolve the user experience issue.
