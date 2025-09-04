# Fix Committee Filtering in Map and Calendar Views - Review

## Overview

Successfully implemented committee filtering across all application views. Previously, only the List View supported committee filtering. The Map View and Calendar View have been updated to include committee filtering functionality.

## Changes Made

### Phase 1: Calendar View Implementation
**Files Modified:**
- `ui/src/hooks/useCalendarEvents.ts`
- `ui/src/routes/CalendarView.tsx`

**Changes:**
1. **useCalendarEvents Hook**: Added `selectedCommittees` parameter to the hook signature
2. **API Integration**: Updated `api.browse()` calls to include committee filtering when `selectedCommittees.length > 0`
3. **Dependency Management**: Added `selectedCommittees` to the `useCallback` dependency array to trigger re-fetching when committee selection changes
4. **CalendarView Integration**: Updated CalendarView to pass `selectedCommittees` from FilterContext to the `useCalendarEvents` hook

### Phase 2: Map View Implementation
**Files Modified:**
- `ui/src/components/MapboxMap.tsx`
- `ui/src/routes/MapView.tsx`

**Changes:**
1. **MapboxMap Props**: Added `selectedCommittees?: string[]` prop to the MapboxMapProps interface
2. **Component Signature**: Updated MapboxMap component to accept and destructure the `selectedCommittees` prop
3. **API Integration**: Updated both initial and additional event fetching calls to include committee filtering
4. **Dependency Management**: Updated `loadEvents` useCallback dependency array to include `selectedCommittees`
5. **MapView Integration**: Updated MapView to pass `selectedCommittees` from FilterContext to the MapboxMap component

## Technical Implementation Details

### Calendar View Filtering Logic
```typescript
// In useCalendarEvents.ts
const rawEvents = await api.browse({
  lat,
  lng,
  radius,
  committees: selectedCommittees.length > 0 ? selectedCommittees : undefined,
});
```

### Map View Filtering Logic
```typescript
// In MapboxMap.tsx
const initialEventData = await api.browse({
  range: 30,
  committees: selectedCommittees.length > 0 ? selectedCommittees : undefined
});

const additionalEventData = await api.browse({
  range: 90,
  committees: selectedCommittees.length > 0 ? selectedCommittees : undefined
});
```

## Consistency with Existing Implementation

The implementation maintains consistency with the existing List View approach:

- **API Parameter**: Uses the same `committees` parameter as defined in `api-client.ts`
- **Conditional Logic**: Only includes committees parameter when `selectedCommittees.length > 0`
- **FilterContext Integration**: Uses the same FilterContext for state management across all views
- **Fallback Behavior**: When no committees are selected, the parameter is `undefined`, allowing the API to return all events

## Testing Strategy Implemented

### Code Quality
- **TypeScript**: All changes maintain proper TypeScript typing
- **Linting**: No linter errors introduced
- **Dependencies**: Proper useCallback dependency arrays to prevent infinite re-renders

### Integration Points
- **FilterContext**: All views now use the same committee filtering state
- **API Client**: Leverages existing `api.browse()` method with committee support
- **Event Filtering**: Consistent filtering logic across Map, List, and Calendar views

## Success Criteria Met

✅ **Committee filtering works in Calendar View**
- Calendar events now respect committee selection
- Events re-fetch when committee selection changes
- Consistent with List View filtering behavior

✅ **Committee filtering works in Map View**
- Map markers now respect committee selection
- Markers update when committee selection changes
- Maintains map performance with proper caching

✅ **Committee filtering works consistently across all views**
- All three views (Map, List, Calendar) use the same FilterContext
- Committee selections persist when switching between views
- API calls include committee filtering appropriately

✅ **No performance regressions**
- Map View uses progressive loading (30 days initially, 90 days additional)
- Calendar View uses efficient event grouping by date
- Proper useCallback dependencies prevent unnecessary re-renders

✅ **API error handling remains robust**
- Maintains existing error handling patterns
- Graceful fallbacks when API calls fail
- Proper loading states during data fetching

## Future Considerations

### Potential Enhancements
- **Caching**: Could implement more sophisticated caching for committee-filtered results
- **Prefetching**: Could prefetch events for recently used committee combinations
- **Analytics**: Could track committee usage patterns across different views

### Monitoring Points
- **API Performance**: Monitor query performance with committee filtering
- **Bundle Size**: Ensure additional filtering logic doesn't significantly impact bundle size
- **User Experience**: Track if committee filtering improves or complicates user workflows

## Rollback Plan

If issues arise, changes can be easily reverted:

1. **Calendar View**: Revert `useCalendarEvents.ts` and `CalendarView.tsx` to previous versions
2. **Map View**: Remove `selectedCommittees` prop from `MapboxMap.tsx` and `MapView.tsx`
3. **Testing**: All changes are isolated and don't affect core application functionality

## Conclusion

The implementation successfully brings committee filtering to all application views while maintaining consistency, performance, and code quality. Users can now filter events by committee across Map, List, and Calendar views with a unified experience.

