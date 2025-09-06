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
import EventTypeFilter from '@/components/EventTypeFilter';
import CommitteeFilter from '@/components/CommitteeFilter';
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
	const { selectedEventTypes, setSelectedEventTypes, selectedCommittees, setSelectedCommittees, selectedDistance, setSelectedDistance } = useFilterContext();
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
			<div className="mx-auto max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
				<div className="space-y-2">
					{/* Event Type Filter - Keep it visible during loading */}
					<EventTypeFilter
						selectedTypes={selectedEventTypes}
						onTypesChange={setSelectedEventTypes}
					/>

					{/* Committee Filter - Keep it visible during loading */}
					<CommitteeFilter
						selectedCommittees={selectedCommittees}
						onCommitteesChange={setSelectedCommittees}
					/>

					{/* Distance Filter - Keep it visible during loading */}
					<DistanceFilter
						selectedDistance={selectedDistance}
						onDistanceChange={setSelectedDistance}
					/>

					{/* Month Navigation Skeleton */}
					<Skeleton className="h-16 w-full rounded-lg p-4" />

					{/* Calendar Grid Skeleton */}
					<div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
						<Skeleton className="h-96 w-full rounded-lg" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
			<div className="space-y-2">
				{/* Event Type Filter */}
				<EventTypeFilter
					selectedTypes={selectedEventTypes}
					onTypesChange={setSelectedEventTypes}
				/>

				{/* Committee Filter */}
				<CommitteeFilter
					selectedCommittees={selectedCommittees}
					onCommitteesChange={setSelectedCommittees}
				/>

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
				<div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-lg border">
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
				<div className="grid grid-cols-1 gap-6">
					{/* Calendar Grid */}
					<div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
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
