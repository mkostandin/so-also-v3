import { useState, useCallback } from 'react';
import CalendarGrid from '@/components/CalendarGrid';
import CalendarEventPopup from '@/components/CalendarEventPopup';
import LocationPermissionOverlay from '@/components/LocationPermissionOverlay';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EventTypeFilter from '@/components/EventTypeFilter';
import DistanceFilter from '@/components/DistanceFilter';
import { useFilterContext } from './MapIndex';

export default function CalendarView() {
	const [cursor, setCursor] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [popupDate, setPopupDate] = useState<Date | null>(null);
	const [popupEvents, setPopupEvents] = useState<CalendarEvent[]>([]);
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const { selectedEventTypes, setSelectedEventTypes, selectedDistance, setSelectedDistance } = useFilterContext();

	const year = cursor.getFullYear();
	const month = cursor.getMonth();

	const { eventsByDate, loading, error, refetch } = useCalendarEvents(selectedDistance, selectedEventTypes);

	// Helper function to get event count display text
	const getEventCountDisplayText = (distance: string): string => {
		switch (distance) {
			case "all":
				return "Showing all events";
			case "500":
				return "Showing events within 500 miles";
			case "150":
				return "Showing events within 150 miles";
			case "50":
				return "Showing events within 50 miles";
			default:
				return "Showing events within 150 miles";
		}
	};

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



	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleEventClick = useCallback((_event: CalendarEvent) => {
		// Event navigation is handled by Link component in CalendarEventPopup
		// Parameter is available for future analytics or additional functionality
		setIsPopupOpen(false);
	}, []);

	if (loading) {
		return (
			<div className="mx-auto max-w-4xl p-2">
				<div className="space-y-4">
					<Skeleton className="h-8 w-64" />
					<div className="grid grid-cols-1 gap-6">
						<Skeleton className="h-96 w-full" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl p-2">
			<div className="space-y-4">
				{/* Event Type Filter */}
				<EventTypeFilter
					selectedTypes={selectedEventTypes}
					onTypesChange={setSelectedEventTypes}
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

				{/* Event Count Display */}
				<div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
					{getEventCountDisplayText(selectedDistance)}
				</div>

				{/* Location Permission Overlay */}
				<LocationPermissionOverlay />

				{/* Event Popup */}
				<CalendarEventPopup
					events={popupEvents}
					date={popupDate || new Date()}
					isOpen={isPopupOpen}
					onClose={handlePopupClose}
					onEventClick={handleEventClick}
				/>
			</div>
		</div>
	);
}
