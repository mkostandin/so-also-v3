import { cn } from '@/lib/utils';
import { useCallback, useRef, useEffect } from 'react';
import { useFilterContext } from '@/routes/MapIndex';

/**
 * Available event type categories for filtering - display names (plural)
 * @constant
 */
export const EVENT_TYPES = ['Events', 'Committee Meetings', 'Conferences', 'YPAA Meetings', 'Other'] as const;

/**
 * Mapping from display names to actual data values for filtering
 * Display names are plural for user experience, but data uses singular forms
 */
const EVENT_TYPE_MAPPING: Record<string, string> = {
	'Events': 'Event',
	'Committee Meetings': 'Committee Meeting',
	'Conferences': 'Conference',
	'YPAA Meetings': 'YPAA Meeting',
	'Other': 'Other'
};

/**
 * Props for the EventTypeFilter component
 */
interface EventTypeFilterProps {
  /** Currently selected event type filters */
  selectedTypes: string[];
  /** Callback to update selected types, supports both direct array and function updates */
  onTypesChange: (types: string[] | ((prev: string[]) => string[])) => void;
}

/**
 * Horizontal scrollable event type filter component
 *
 * Features:
 * - Single-line horizontal layout with scrolling
 * - Scroll position persistence across view changes
 * - Touch-friendly interactions for mobile devices
 * - Real-time filter updates with smooth animations
 * - Accessibility support with ARIA labels and keyboard navigation
 *
 * @param props Component props
 * @returns React component for filtering events by type
 */
export default function EventTypeFilter({ selectedTypes, onTypesChange }: EventTypeFilterProps) {
  // Reference to the scrollable container for position management
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Access filter context for scroll position persistence
  const { filterScrollPosition, setFilterScrollPosition } = useFilterContext();

  /**
   * Converts display names (plural) to data values (singular) for filtering
   * @param displayName The user-facing display name
   * @returns The corresponding data value for filtering
   */
  const getDataValue = useCallback((displayName: string) => {
    return EVENT_TYPE_MAPPING[displayName] || displayName;
  }, []);

  /**
   * Converts data values (singular) back to display names (plural) for UI
   * @param dataValue The actual data value
   * @returns The user-facing display name
   */
  const getDisplayName = useCallback((dataValue: string) => {
    const reverseMapping = Object.fromEntries(
      Object.entries(EVENT_TYPE_MAPPING).map(([display, data]) => [data, display])
    );
    return reverseMapping[dataValue] || dataValue;
  }, []);

  /**
   * Handles toggling of event type filters
   * Converts display names to data values for proper filtering
   */
  const handleTypeToggle = useCallback((displayName: string) => {
    const dataValue = getDataValue(displayName);
    onTypesChange(prevTypes => {
      const isSelected = prevTypes.includes(dataValue);
      return isSelected
        ? prevTypes.filter(t => t !== dataValue)  // Remove if already selected
        : [...prevTypes, dataValue];              // Add if not selected (use data value)
    });
  }, [onTypesChange, getDataValue]);

  /**
   * Restores scroll position instantly when component mounts
   * Uses requestAnimationFrame to ensure DOM is fully ready
   * Temporarily disables smooth scrolling for instant position restoration
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && filterScrollPosition > 0) {
      // Use requestAnimationFrame to ensure DOM is ready before setting scroll position
      requestAnimationFrame(() => {
        // Temporarily disable smooth scrolling to restore position instantly without animation
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = filterScrollPosition;

        // Re-enable smooth scrolling after position is set
        requestAnimationFrame(() => {
          if (container) {
            container.style.scrollBehavior = '';
          }
        });
      });
    }
  }, []); // Only run once on mount to avoid jarring effects during view switches

  /**
   * Saves scroll position to context when it changes
   * Uses debouncing to prevent excessive context updates during scrolling
   * Properly cleans up event listeners and timeouts
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      let scrollTimeout: NodeJS.Timeout | null = null;

      /**
       * Handles scroll events with debouncing
       * Saves position to context after user stops scrolling for 150ms
       */
      const handleScroll = () => {
        // Clear any existing timeout to reset debounce timer
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        // Debounce scroll position saves to prevent excessive context updates
        scrollTimeout = setTimeout(() => {
          setFilterScrollPosition(container.scrollLeft);
          scrollTimeout = null;
        }, 150); // 150ms debounce delay
      };

      // Add scroll event listener with passive flag for better performance
      container.addEventListener('scroll', handleScroll, { passive: true });

      // Additional timeout for dynamic content adjustments
      const timeoutId = setTimeout(() => {}, 100);

      // Cleanup function to remove listeners and clear timeouts
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        clearTimeout(timeoutId);
      };
    }
  }, [setFilterScrollPosition]);

  return (
    // Container with background and border for visual separation
    <div className="bg-white dark:bg-gray-900 border-b relative">
      {/* Horizontal scrollable container for filter buttons */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide scroll-smooth horizontal-filter-scroll"
        role="group"
        aria-label="Event type filters"
        tabIndex={-1}
      >
        {EVENT_TYPES.map((displayName, index) => {
          // Check if the corresponding data value is selected
          const dataValue = getDataValue(displayName);
          const isActive = selectedTypes.includes(dataValue);
          return (
            <button
              key={displayName}
              onClick={() => handleTypeToggle(displayName)}
              className={cn(
                // Base button styling with consistent sizing and spacing
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                // Prevent shrinking and enable scroll snap for smooth scrolling experience
                "flex-shrink-0 snap-start",
                // Interactive states with scale animations for better UX
                "hover:scale-105 active:scale-95",
                // Conditional styling based on selection state
                isActive
                  ? "bg-blue-500 text-white shadow-lg transform scale-105"  // Active state: blue background
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"  // Inactive state: gray background
              )}
              // Accessibility attributes for screen readers and tooltips
              aria-label={`Filter by ${displayName}${isActive ? ' (selected)' : ''}`}
              title={`Toggle ${displayName} filter`}
            >
              {displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
