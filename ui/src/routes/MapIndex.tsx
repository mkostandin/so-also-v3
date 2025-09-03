import { useState, createContext, useContext, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EVENT_TYPES } from '@/components/EventTypeFilter';

/**
 * Context type for sharing filter state across map, list, and calendar views
 * Includes event type filters, distance filters, and scroll position persistence
 */
interface FilterContextType {
	/** Currently selected event type filters */
	selectedEventTypes: string[];
	/** Function to update selected event types, supports both direct array and function updates */
	setSelectedEventTypes: (types: string[] | ((prev: string[]) => string[])) => void;
	/** Currently selected distance filter for calendar view */
	selectedDistance: string;
	/** Function to update distance filter */
	setSelectedDistance: (distance: string) => void;
	/** Current horizontal scroll position of filter component */
	filterScrollPosition: number;
	/** Function to update filter scroll position for persistence */
	setFilterScrollPosition: (position: number) => void;
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
	// React Router hooks for navigation and location management
	const location = useLocation();
	const navigate = useNavigate();
	const base = '/app/map';

	// Filter state management with default values
	// Initialize with data values (singular) instead of display names (plural)
	const [selectedEventTypes, setSelectedEventTypesState] = useState<string[]>(() => {
		const EVENT_TYPE_MAPPING: Record<string, string> = {
			'Events': 'Event',
			'Committee Meetings': 'Committee Meeting',
			'Conferences': 'Conference',
			'YPAA Meetings': 'YPAA Meeting',
			'Other': 'Other'
		};
		return EVENT_TYPES.map(displayName => EVENT_TYPE_MAPPING[displayName] || displayName);
	});
	const [selectedDistance, setSelectedDistanceState] = useState<string>("150");
	const [filterScrollPosition, setFilterScrollPositionState] = useState<number>(0);

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

	// Determine current active tab based on current route
	const current = routeToTab(location.pathname);

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
			selectedDistance,
			setSelectedDistance,
			filterScrollPosition,
			setFilterScrollPosition
		}}>
			{/* Main layout container with full height */}
			<div className="flex flex-col h-full">
				{/* Sticky navigation header with backdrop blur effect */}
				<div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur dark:bg-gray-900/60">
					<div className="mx-auto max-w-3xl p-2">
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
				{/* Main content area that takes remaining height and handles overflow */}
				<div className="flex-1 overflow-hidden">
					<Outlet />  {/* Render current route component (MapView, ListView, or CalendarView) */}
				</div>
			</div>
		</FilterContext.Provider>
	);
}
