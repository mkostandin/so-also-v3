import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EVENT_TYPES } from '@/components/EventTypeFilter';

// Create context for sharing filter state
interface FilterContextType {
	selectedEventTypes: string[];
	setSelectedEventTypes: (types: string[] | ((prev: string[]) => string[])) => void;
	selectedDistance: string;
	setSelectedDistance: (distance: string) => void;
}

export const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Hook to use filter context
export const useFilterContext = () => {
	const context = useContext(FilterContext);
	if (!context) {
		throw new Error('useFilterContext must be used within FilterContext.Provider');
	}
	return context;
};

export default function MapIndex() {
	const location = useLocation();
	const navigate = useNavigate();
	const base = '/app/map';
	const [selectedEventTypes, setSelectedEventTypesState] = useState<string[]>(() => [...EVENT_TYPES]);
	const [selectedDistance, setSelectedDistanceState] = useState<string>("150");

	const setSelectedEventTypes = useCallback((types: string[] | ((prev: string[]) => string[])) => {
		setSelectedEventTypesState(prev => {
			if (typeof types === 'function') {
				return types(prev);
			}
			return types;
		});
	}, []);

	const setSelectedDistance = useCallback((distance: string) => {
		setSelectedDistanceState(distance);
	}, []);

	const routeToTab = (pathname: string) => {
		if (pathname.startsWith(`${base}/calendar`)) return 'calendar';
		if (pathname.startsWith(`${base}/list`)) return 'list';
		return 'map';
	};
	const current = routeToTab(location.pathname);

	const onValueChange = (val: string) => {
		if (val === 'map') navigate(base);
		else navigate(`${base}/${val}`);
	};

	return (
		<FilterContext.Provider value={{ selectedEventTypes, setSelectedEventTypes, selectedDistance, setSelectedDistance }}>
			<div className="flex flex-col h-full">
				<div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur dark:bg-gray-900/60">
					<div className="mx-auto max-w-3xl p-2">
						<Tabs value={current} onValueChange={onValueChange}>
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="map">Map</TabsTrigger>
								<TabsTrigger value="list">List</TabsTrigger>
								<TabsTrigger value="calendar">Calendar</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</div>
				<div className="flex-1 overflow-hidden">
					<Outlet />
				</div>
			</div>
		</FilterContext.Provider>
	);
}
