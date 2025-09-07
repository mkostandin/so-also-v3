import CalendarEventIndicator from './CalendarEventIndicator';
import { CalendarEvent } from '@/hooks/useCalendarEvents';

interface CalendarGridProps {
  year: number;
  month: number;
  eventsByDate: Record<string, CalendarEvent[]>;
  onDateClick?: (date: Date, events: CalendarEvent[]) => void;
  onDateHover?: (date: Date, events: CalendarEvent[]) => void;
  selectedDate?: Date;
}

export default function CalendarGrid({
  year,
  month,
  eventsByDate,
  onDateClick,
  onDateHover,
  selectedDate
}: CalendarGridProps) {
	const first = new Date(year, month, 1);
	const startDay = first.getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const cells: (number | null)[] = [];

	// Create empty cells for days before the first day of the month
	for (let i = 0; i < startDay; i++) cells.push(null);

	// Create cells for each day of the month
	for (let d = 1; d <= daysInMonth; d++) cells.push(d);

	// Fill remaining cells to complete the grid
	while (cells.length % 7 !== 0) cells.push(null);

	const getDateKey = (day: number) => {
		const date = new Date(year, month, day);
		return date.toISOString().split('T')[0];
	};

	const getEventsForDate = (day: number) => {
		if (!day) return [];
		const dateKey = getDateKey(day);
		return eventsByDate[dateKey] || [];
	};

	const isSelectedDate = (day: number) => {
		if (!selectedDate || !day) return false;
		return selectedDate.getDate() === day &&
			   selectedDate.getMonth() === month &&
			   selectedDate.getFullYear() === year;
	};

	return (
		<div className="grid grid-cols-7 gap-0.5 sm:gap-1">
			{['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
				<div key={d} className="p-0.5 sm:p-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
					{d}
				</div>
			))}
			{cells.map((d, idx) => {
				const events = d ? getEventsForDate(d) : [];
				const isSelected = d ? isSelectedDate(d) : false;
				const hasEvents = events.length > 0;

				return (
					<div
						key={idx}
						className={`
							min-h-[40px] sm:min-h-[48px] rounded border p-0.5 sm:p-1 cursor-pointer transition-colors
							${d ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800'}
							${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
							${hasEvents ? 'border-blue-200 dark:border-blue-800' : ''}
						`}
						onClick={() => {
							if (d && events.length > 0) {
								const date = new Date(year, month, d);
								onDateClick?.(date, events);
							}
						}}
						onMouseEnter={() => {
							if (d && events.length > 0) {
								const date = new Date(year, month, d);
								onDateHover?.(date, events);
							}
						}}
					>
						{d && (
							<div className="flex items-center justify-between text-xs h-4 sm:h-5">
								<span className={`font-medium text-xs sm:text-sm ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
									{d}
								</span>
								{hasEvents && (
									<CalendarEventIndicator
										count={events.length}
										onClick={() => {
											const date = new Date(year, month, d);
											onDateClick?.(date, events);
										}}
									/>
								)}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
