import { useState, useCallback, useEffect } from 'react';
import CalendarGrid from '@/components/CalendarGrid';
import CalendarEventPopup from '@/components/CalendarEventPopup';
import LocationPermissionOverlay from '@/components/LocationPermissionOverlay';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { useUserLocation } from '@/hooks/useUserLocation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DistanceFilter from '@/components/DistanceFilter';
import { useFilterContext } from './MapIndex';

/**
 * Interactive calendar view component for displaying events by date
 *
 * Features:
 * - Monthly calendar with event indicators
 * - Click-to-view event details in popup
 * - Distance and event type filtering
 * - Location-based event discovery
 * - Responsive design for all devices
 *
 * @returns React component
 */
export default function CalendarView() {
	const [cursor, setCursor] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [popupDate, setPopupDate] = useState<Date | null>(null);
	const [popupEvents, setPopupEvents] = useState<CalendarEvent[]>([]);
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const { selectedEventTypes, selectedCommittees, selectedDistance, setSelectedDistance } = useFilterContext();
	const { coords: userCoords, status, request } = useUserLocation();

	const year = cursor.getFullYear();
	const month = cursor.getMonth();


	// Auto-request location if permission is granted but we don't have coordinates
	useEffect(() => {
		if (status === 'granted' && !userCoords) {
			request();
		}
	}, [status, userCoords, request]);

	// Fetch calendar events with distance, event type, and committee filtering
	const { eventsByDate, loading, error, refetch, showSkeleton } = useCalendarEvents(
		selectedDistance,
		selectedEventTypes,
		selectedCommittees,
		userCoords
	);


	/**
	 * Handle user clicking on a calendar date to show event details popup
	 * @param date - The clicked date
	 * @param events - Array of events for that date
	 */
	const handleDateClick = useCallback((date: Date, events: CalendarEvent[]) => {
		setSelectedDate(date);
		setPopupDate(date);
		setPopupEvents(events);
		setIsPopupOpen(true);
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleDateHover = useCallback((_date: Date, _events: CalendarEvent[]) => {
		// Optional: Could show a tooltip or mini preview on hover
		// Parameters are available for future tooltip/preview implementation
	}, []);

	const handlePopupClose = useCallback(() => {
		setIsPopupOpen(false);
		setPopupDate(null);
		setPopupEvents([]);
	}, []);




	if (showSkeleton) {
		return (
			<div className="mx-auto w-full max-w-none px-1 sm:px-3 md:px-6 lg:px-8 xl:max-w-5xl pt-10 space-y-6">
				{/* Skeleton container uses pt-10 (vs main content pt-2) intentionally to create visual breathing room during loading state and maintain proper alignment with global filters positioned at top-[72px] */}
				{/* Distance Filter Skeleton - positioned 8px below filters and shifted right 8px. Responsive margins: base(12px,4px) → sm(20px,12px) → md(32px,24px) = consistent 8px right shift */}
				<Skeleton className="h-12 w-4/5 sm:w-2/3 rounded-lg ml-3 mr-1 sm:ml-5 sm:mr-3 md:ml-8 md:mr-6" />

				{/* Month Navigation Skeleton - positioned 8px below filters and shifted right 8px. Responsive margins: base(12px,4px) → sm(20px,12px) → md(32px,24px) = consistent 8px right shift */}
				<Skeleton className="h-12 w-11/12 sm:w-10/12 rounded-lg ml-3 mr-1 sm:ml-5 sm:mr-3 md:ml-8 md:mr-6" />

				{/* Calendar Grid Skeleton - positioned 8px below filters and shifted right 8px. Responsive margins: base(12px,4px) → sm(20px,12px) → md(32px,24px) = consistent 8px right shift */}
				<Skeleton className="h-64 w-11/12 sm:w-10/12 rounded-lg ml-3 mr-1 sm:ml-5 sm:mr-3 md:ml-8 md:mr-6" />
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-none px-1 sm:px-3 md:px-6 lg:px-8 xl:max-w-5xl pt-2">
			{/* Distance Filter - view-specific filter positioned below global fixed filters */}
			{/* top-[138px] = global filters (top-[72px]) + global filter height (~56px) + spacing (~10px) */}
			{/* mt-1 provides additional 4px visual separation from global filters */}
			{/* Sticky positioning keeps distance filter visible while scrolling, but below global filters */}
			<div className="sticky top-[138px] mt-1 z-30 bg-white dark:bg-gray-900 p-1 sm:p-2 space-y-2">

				{/* Distance Filter */}
				<DistanceFilter
					selectedDistance={selectedDistance}
					onDistanceChange={setSelectedDistance}
				/>

				{/* Error State */}
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{error}
						</AlertDescription>
					</Alert>
				)}

				{/* Month Navigation */}
				<div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 sm:p-4 rounded-lg border mx-1 sm:mx-3">
					<Button
						variant="outline"
						onClick={() => setCursor(new Date(year, month - 1, 1))}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						{cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
					</div>
					<Button
						variant="outline"
						onClick={() => setCursor(new Date(year, month + 1, 1))}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>

				{/* Main Content */}
				<div className="grid grid-cols-1 gap-4 sm:gap-6">
					{/* Calendar Grid */}
					<div className="bg-white dark:bg-gray-900 p-2 sm:p-4 rounded-lg border mx-1 sm:mx-3">
						<CalendarGrid
							year={year}
							month={month}
							eventsByDate={eventsByDate}
							onDateClick={handleDateClick}
							onDateHover={handleDateHover}
							selectedDate={selectedDate || undefined}
						/>
					</div>
				</div>

				{/* Location Permission Overlay */}
				<LocationPermissionOverlay />

				{/* Enhanced Event Popup - Direct navigation, custom two-column layout */}
				<CalendarEventPopup
					events={popupEvents}
					date={popupDate || new Date()}
					isOpen={isPopupOpen}
					onClose={handlePopupClose}
				/>
			</div>
		</div>
	);
}
