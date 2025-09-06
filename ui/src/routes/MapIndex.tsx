import { useState, createContext, useContext, useCallback, useEffect, useMemo } from 'react';
import { useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EVENT_TYPES } from '@/components/EventTypeFilter';
import { api, EventItem } from '@/lib/api-client';
import { useUserLocation } from '@/hooks/useUserLocation';


/**
 * Context type for sharing filter state and events data across map, list, and calendar views
 * Includes event type filters, committee filters, distance filters, scroll position persistence, and shared events
 */
interface FilterContextType {
	/** Currently selected event type filters */
	selectedEventTypes: string[];
	/** Function to update selected event types, supports both direct array and function updates */
	setSelectedEventTypes: (types: string[] | ((prev: string[]) => string[])) => void;
	/** Currently selected committee filters (slugs) */
	selectedCommittees: string[];
	/** Function to update selected committees */
	setSelectedCommittees: (committees: string[] | ((prev: string[]) => string[])) => void;
	/** Currently selected distance filter for calendar view */
	selectedDistance: string;
	/** Function to update distance filter */
	setSelectedDistance: (distance: string) => void;
	/** Current horizontal scroll position of filter component */
	filterScrollPosition: number;
	/** Function to update filter scroll position for persistence */
	setFilterScrollPosition: (position: number) => void;
	/** Shared events data for all views */
	events: EventItem[];
	/** Loading state for events */
	eventsLoading: boolean;
	/** Error state for events */
	eventsError: string | null;
}

/**
 * React context for sharing filter state across application views
 * Provides centralized state management for event filters and scroll position
 */
export const FilterContext = createContext<FilterContextType | undefined>(undefined);

/**
 * Custom hook to access filter context
 * @throws Error if used outside of FilterContext.Provider
 * @returns FilterContextType with current filter state and update functions
 */
export const useFilterContext = () => {
	const context = useContext(FilterContext);
	if (!context) {
		throw new Error('useFilterContext must be used within FilterContext.Provider');
	}
	return context;
};

/**
 * Main layout component for map application views
 * Provides shared context for filters, navigation, and scroll position persistence
 * Handles routing between map, list, and calendar views
 */
export default function MapIndex() {
	const contentRef = useRef<HTMLDivElement | null>(null);
	// React Router hooks for navigation and location management
	const location = useLocation();
	const navigate = useNavigate();
	const base = '/app/map';

	// Move expensive mapping outside component to prevent recalculation on every render
	const EVENT_TYPE_MAPPING: Record<string, string> = {
		'Events': 'Event',
		'Committee Meetings': 'Committee Meeting',
		'Conferences': 'Conference',
		'YPAA Meetings': 'YPAA Meeting',
		'Other': 'Other'
	};

	// Filter state management with default values
	// Initialize with data values (singular) instead of display names (plural)
	const [selectedEventTypes, setSelectedEventTypesState] = useState<string[]>(() =>
		EVENT_TYPES.map(displayName => EVENT_TYPE_MAPPING[displayName] || displayName)
	);
	const [selectedCommittees, setSelectedCommitteesState] = useState<string[]>([]);
	const [selectedDistance, setSelectedDistanceState] = useState<string>("150");
	const [filterScrollPosition, setFilterScrollPositionState] = useState<number>(0);

	// Shared events state for all views
	const [events, setEvents] = useState<EventItem[]>([]);
	const [eventsLoading, setEventsLoading] = useState(true);
	const [eventsError, setEventsError] = useState<string | null>(null);

	// Local storage persistence for committee selections
	useEffect(() => {
		try {
			const savedCommittees = localStorage.getItem('selected-committees');
			if (savedCommittees) {
				const parsed = JSON.parse(savedCommittees);
				if (Array.isArray(parsed)) {
					setSelectedCommitteesState(parsed);
				}
			}
		} catch (error) {
			console.warn('Failed to load committee selections from localStorage:', error);
		}
	}, []);

	// Save committee selections to localStorage when they change
	useEffect(() => {
		try {
			if (selectedCommittees.length === 0) {
				localStorage.removeItem('selected-committees');
			} else {
				localStorage.setItem('selected-committees', JSON.stringify(selectedCommittees));
			}
		} catch (error) {
			console.warn('Failed to save committee selections to localStorage:', error);
		}
	}, [selectedCommittees]);

	// Location hook for location-based API calls
	const { coords, status } = useUserLocation();

	/**
	 * Callback to update selected event types
	 * Supports both direct array assignment and functional updates
	 */
	const setSelectedEventTypes = useCallback((types: string[] | ((prev: string[]) => string[])) => {
		setSelectedEventTypesState(prev => {
			if (typeof types === 'function') {
				return types(prev);  // Functional update for complex state changes
			}
			return types;  // Direct assignment for simple updates
		});
	}, []);

	/**
	 * Callback to update selected committees
	 * Supports both direct array assignment and functional updates
	 */
	const setSelectedCommittees = useCallback((committees: string[] | ((prev: string[]) => string[])) => {
		setSelectedCommitteesState(prev => {
			if (typeof committees === 'function') {
				return committees(prev);  // Functional update for complex state changes
			}
			return committees;  // Direct assignment for simple updates
		});
	}, []);

	/** Callback to update selected distance filter */
	const setSelectedDistance = useCallback((distance: string) => {
		setSelectedDistanceState(distance);
	}, []);

	/** Callback to update filter scroll position for persistence */
	const setFilterScrollPosition = useCallback((position: number) => {
		setFilterScrollPositionState(position);
	}, []);

	/**
	 * Maps current pathname to tab identifier
	 * @param pathname Current route pathname
	 * @returns Tab identifier ('map', 'list', or 'calendar')
	 */
	const routeToTab = (pathname: string) => {
		if (pathname.startsWith(`${base}/calendar`)) return 'calendar';
		if (pathname.startsWith(`${base}/list`)) return 'list';
		return 'map';  // Default to map view
	};

	// Determine current active tab based on current route (memoized to prevent unnecessary re-renders)
	const current = useMemo(() => routeToTab(location.pathname), [location.pathname]);

	// Fetch events once and share across all views
	useEffect(() => {
		let mounted = true;

		const fetchEvents = async () => {
			try {
				setEventsLoading(true);
				setEventsError(null);

				// Use location-based API call when coordinates are available
				let apiParams: any = { range: 30 }; // Reduced from 90 to 30 for better performance

				if (coords) {
					// Use location-based browsing when user location is available
					apiParams = {
						lat: coords.lat,
						lng: coords.lng,
						radius: 321869 // 200 miles in meters
					};
				}

				// Add committee filtering if committees are selected
				if (selectedCommittees.length > 0) {
					apiParams.committees = selectedCommittees;
				}

				const data = await api.browse(apiParams);
				if (mounted) {
					setEvents(data || []);
				}
			} catch (error) {
				console.error('Failed to fetch events:', error);
				if (mounted) {
					setEventsError('Failed to load events');
					setEvents([]);
				}
			} finally {
				if (mounted) {
					setEventsLoading(false);
				}
			}
		};

		fetchEvents();

		return () => {
			mounted = false;
		};
	}, [coords, selectedCommittees, current]); // Re-fetch when coordinates, committees, OR view changes


	/**
	 * Handles tab navigation changes
	 * @param val New tab value to navigate to
	 */
	const onValueChange = (val: string) => {
		if (val === 'map') navigate(base);  // Navigate to base map route
		else navigate(`${base}/${val}`);    // Navigate to specific view
	};

	return (
		// Provide filter context to all child components for state sharing
		<FilterContext.Provider value={{
			selectedEventTypes,
			setSelectedEventTypes,
			selectedCommittees,
			setSelectedCommittees,
			selectedDistance,
			setSelectedDistance,
			filterScrollPosition,
			setFilterScrollPosition,
			events,
			eventsLoading,
			eventsError
		}}>
			{/* Main layout container with full height */}
			<div className="flex flex-col h-full">
				{/* Sticky navigation header with backdrop blur effect */}
				<div data-id="map-tabs" className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur dark:bg-gray-900/60 touch-pan-y">
					<div className="mx-auto max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-2">
						{/* Tab navigation for switching between map, list, and calendar views */}
						<Tabs value={current} onValueChange={onValueChange}>
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="map">Map</TabsTrigger>
								<TabsTrigger value="list">List</TabsTrigger>
								<TabsTrigger value="calendar">Calendar</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</div>
				{/* Main content area: single scroll owner for all views */}
				<div ref={contentRef} className="flex-1 min-h-0 relative z-0 overflow-y-auto pb-16 scroll-touch scroll-pan-y scrollbar-stable overscroll-none select-auto">
					<Outlet />  {/* Render current route component (MapView, ListView, or CalendarView) */}
				</div>
			</div>
		</FilterContext.Provider>
	);
}
