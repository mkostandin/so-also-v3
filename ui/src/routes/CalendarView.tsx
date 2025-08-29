import { useState } from 'react';
import CalendarGrid from '@/components/CalendarGrid';
import CalendarEventList from '@/components/CalendarEventList';
import CalendarEventPopup from '@/components/CalendarEventPopup';
import LocationStatus from '@/components/LocationStatus';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CalendarView() {
	const [cursor, setCursor] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [popupDate, setPopupDate] = useState<Date | null>(null);
	const [popupEvents, setPopupEvents] = useState<CalendarEvent[]>([]);
	const [isPopupOpen, setIsPopupOpen] = useState(false);

	const year = cursor.getFullYear();
	const month = cursor.getMonth();

	const { events, eventsByDate, loading, error, refetch } = useCalendarEvents(90);

	const handleDateClick = (date: Date, events: CalendarEvent[]) => {
		setSelectedDate(date);
		setPopupDate(date);
		setPopupEvents(events);
		setIsPopupOpen(true);
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleDateHover = (_date: Date, _events: CalendarEvent[]) => {
		// Optional: Could show a tooltip or mini preview on hover
		// Parameters are available for future tooltip/preview implementation
	};

	const handlePopupClose = () => {
		setIsPopupOpen(false);
		setPopupDate(null);
		setPopupEvents([]);
	};

	const handleTodayClick = () => {
		const today = new Date();
		setCursor(today);
		setSelectedDate(today);
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleEventClick = (_event: CalendarEvent) => {
		// Event navigation is handled by Link component in CalendarEventList/CalendarEventPopup
		// Parameter is available for future analytics or additional functionality
		setIsPopupOpen(false);
	};

	if (loading) {
		return (
			<div className="mx-auto max-w-4xl p-4">
				<div className="space-y-4">
					<Skeleton className="h-8 w-64" />
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2">
							<Skeleton className="h-96 w-full" />
						</div>
						<div>
							<Skeleton className="h-64 w-full" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl p-4">
			<div className="space-y-4">
				{/* Header with navigation */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<CalendarIcon className="h-6 w-6 text-gray-600" />
						<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
							Event Calendar
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleTodayClick}
						>
							Today
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={refetch}
							disabled={loading}
						>
							<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
						</Button>
					</div>
				</div>

				{/* Location Status */}
				<LocationStatus />

				{/* Error State */}
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{error}
							<Button
								variant="outline"
								size="sm"
								onClick={refetch}
								className="ml-2"
							>
								Retry
							</Button>
						</AlertDescription>
					</Alert>
				)}

				{/* Month Navigation */}
				<div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-lg border">
					<Button
						variant="outline"
						onClick={() => setCursor(new Date(year, month - 1, 1))}
					>
						← Previous
					</Button>
					<div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						{cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
					</div>
					<Button
						variant="outline"
						onClick={() => setCursor(new Date(year, month + 1, 1))}
					>
						Next →
					</Button>
				</div>

				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Calendar Grid */}
					<div className="lg:col-span-2">
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

					{/* Event List for Selected Date */}
					<div className="lg:col-span-1">
						{selectedDate ? (
							<CalendarEventList
								events={eventsByDate[selectedDate.toISOString().split('T')[0]] || []}
								selectedDate={selectedDate}
								onEventClick={handleEventClick}
							/>
						) : (
							<div className="bg-white dark:bg-gray-900 p-6 rounded-lg border text-center">
								<CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
									Select a Date
								</h3>
								<p className="text-gray-600 dark:text-gray-400">
									Click on a date in the calendar to view events for that day.
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Statistics */}
				<div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
						<div>
							<div className="text-2xl font-bold text-blue-600">{events.length}</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">Total Events</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-green-600">
								{Object.keys(eventsByDate).length}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">Days with Events</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-purple-600">
								{events.filter(e => e.itemType === 'event').length}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">One-time Events</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-orange-600">
								{events.filter(e => e.itemType === 'occurrence').length}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">Recurring Events</div>
						</div>
					</div>
				</div>

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
