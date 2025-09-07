import { cn } from '@/lib/utils';
import { useCallback, useRef, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { CACHE_KEY_COMMITTEES, CACHE_DURATION_MINUTES } from '@/lib/committee-cache';

/**
 * Committee interface for dropdown options
 */
interface Committee {
  id: string;
  name: string; // ALL CAPS normalized name
  slug: string;
  lastSeen: string;
  eventCount?: number; // Number of upcoming events for this committee
}

/**
 * Props for the CommitteeFilter component
 */
interface CommitteeFilterProps {
  /** Currently selected committee filters (slugs) */
  selectedCommittees: string[];
  /** Callback to update selected committees */
  onCommitteesChange: (committees: string[] | ((prev: string[]) => string[])) => void;
}

/**
 * Committee filter dropdown component with ALL CAPS display
 *
 * Features:
 * - Dropdown with ALL CAPS committee names
 * - Multi-select functionality
 * - "ALL COMMITTEES" default option
 * - Alphabetical sorting by normalized name
 * - Loading and error states
 * - Responsive design
 *
 * @param props Component props
 * @returns React component for filtering events by committee
 */
// Cache configuration moved to '@/lib/committee-cache'

export default function CommitteeFilter({ selectedCommittees, onCommitteesChange }: CommitteeFilterProps) {
  // State for committees data with localStorage persistence
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Reference to dropdown container for click-outside handling
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Note: Unlike EventTypeFilter, this component does not use FilterContext for scroll position persistence
  // because the dropdown is a vertical list that doesn't benefit from horizontal scroll position memory.
  // The dropdown always opens at the top and users can scroll through the list as needed.

  /**
   * Fetches committees from API with localStorage caching
   */
  const fetchCommittees = useCallback(async () => {
    try {
      // Check if we have cached data that's less than 5 minutes old
      const cached = localStorage.getItem(CACHE_KEY_COMMITTEES);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const cacheAge = Date.now() - timestamp;
        const CACHE_DURATION = CACHE_DURATION_MINUTES * 60 * 1000; // 5 minutes

        if (cacheAge < CACHE_DURATION) {
          setCommittees(data);
          setLoading(false);
          setError(null);
          return;
        }
      }

      setLoading(true);
      setError(null);
      const data = await api.getCommittees(true); // Include event counts
      setCommittees(data || []);

      // Cache the data
      localStorage.setItem(CACHE_KEY_COMMITTEES, JSON.stringify({
        data: data || [],
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error('Failed to fetch committees:', err);
      setError('Failed to load committees');

      // Try to use cached data as fallback
      const cached = localStorage.getItem(CACHE_KEY_COMMITTEES);
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          setCommittees(data);
        } catch {
          // If cached data is corrupted, show sample data
          setCommittees([
            { id: '1', name: 'NECYPAA', slug: 'necypaa', lastSeen: new Date().toISOString(), eventCount: 15 },
            { id: '2', name: 'MSCYPAA', slug: 'mscypaa', lastSeen: new Date().toISOString(), eventCount: 12 },
            { id: '3', name: 'RISCYPAA', slug: 'riscypaa', lastSeen: new Date().toISOString(), eventCount: 8 },
          ]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual refresh function removed (unused)

  // Fetch committees on component mount (only if not cached)
  useEffect(() => {
    fetchCommittees();
  }, [fetchCommittees]);

  /**
   * Handles clicking outside dropdown to close it
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Toggles committee selection
   */
  const handleCommitteeToggle = useCallback((committeeSlug: string | null) => {
    onCommitteesChange(prevCommittees => {
      if (committeeSlug === null) {
        // "ALL COMMITTEES" option - clear all selections
        return [];
      }

      const isSelected = prevCommittees.includes(committeeSlug);
      if (isSelected) {
        // Remove committee from selection
        return prevCommittees.filter(slug => slug !== committeeSlug);
      } else {
        // Add committee to selection
        return [...prevCommittees, committeeSlug];
      }
    });
  }, [onCommitteesChange]);

  /**
   * Gets display text for selected committees
   */
  const getDisplayText = useCallback(() => {
    if (selectedCommittees.length === 0) {
      return 'ALL COMMITTEES';
    }

    if (selectedCommittees.length === 1) {
      const committee = committees.find(c => c.slug === selectedCommittees[0]);
      return committee?.name || selectedCommittees[0];
    }

    return `${selectedCommittees.length} COMMITTEES SELECTED`;
  }, [selectedCommittees, committees]);

  /**
   * Checks if a committee is selected
   */
  const isCommitteeSelected = useCallback((committeeSlug: string | null) => {
    if (committeeSlug === null) {
      return selectedCommittees.length === 0;
    }
    return selectedCommittees.includes(committeeSlug);
  }, [selectedCommittees]);

  // Don't render if loading and no committees yet
  if (loading && committees.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border-b px-4 py-2">
        <div className="text-sm text-gray-500">Loading committees...</div>
      </div>
    );
  }

  // Show error state but still render with sample data
  if (error && committees.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border-b px-4 py-2">
        <div className="text-sm text-red-500">{error} - Using sample data</div>
      </div>
    );
  }


  return (
    <div className="bg-white dark:bg-gray-900 border-b relative">
      <div className="px-4 py-2">
        {/* Dropdown trigger */}
        <div
          ref={dropdownRef}
          className="relative"
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-full px-4 py-2 text-left rounded-md border transition-all duration-200",
              "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "flex items-center justify-between"
            )}
            aria-label="Select committees to filter by"
            aria-haspopup="listbox"
          >
            <span className="text-sm font-medium truncate">
              {getDisplayText()}
            </span>
            <svg
              className={cn(
                "w-5 h-5 transition-transform duration-200 flex-shrink-0 ml-2",
                isOpen ? "transform rotate-180" : ""
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div
              className={cn(
                "absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800",
                "border border-gray-300 dark:border-gray-600 rounded-md shadow-lg",
                "max-h-[60vh] overflow-y-auto scroll-touch scroll-pan-y select-auto z-50"
              )}
              role="listbox"
              aria-label="Committee options"
            >
              {/* ALL COMMITTEES option */}
              <button
                onClick={() => handleCommitteeToggle(null)}
                className={cn(
                  "w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700",
                  "transition-colors duration-150",
                  "flex items-center space-x-2",
                  isCommitteeSelected(null)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "text-gray-900 dark:text-gray-100"
                )}
                role="option"
              >
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex-shrink-0",
                  isCommitteeSelected(null)
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300 dark:border-gray-600"
                )}>
                  {isCommitteeSelected(null) && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium">ALL COMMITTEES</span>
              </button>

              {/* Committee options */}
              {committees.map((committee) => (
                <button
                  key={committee.slug}
                  onClick={() => handleCommitteeToggle(committee.slug)}
                  className={cn(
                    "w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700",
                    "transition-colors duration-150",
                    "flex items-center space-x-2",
                    isCommitteeSelected(committee.slug)
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "text-gray-900 dark:text-gray-100"
                  )}
                  role="option"
                >
                  <div className={cn(
                    "w-4 h-4 rounded border-2 flex-shrink-0",
                    isCommitteeSelected(committee.slug)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  )}>
                    {isCommitteeSelected(committee.slug) && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium">{committee.name}</span>
                    {committee.eventCount !== undefined && committee.eventCount > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({committee.eventCount})
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
