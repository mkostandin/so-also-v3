import { useMemo, useState } from 'react';
import CalendarGrid from '@/components/CalendarGrid';

export default function CalendarView() {
	const [cursor, setCursor] = useState(new Date());
	const year = cursor.getFullYear();
	const month = cursor.getMonth();
	const datesWithEvents = useMemo(() => new Set<number>(), []);
	return (
		<div className="mx-auto max-w-3xl p-2">
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<button onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded border px-2 py-1">Prev</button>
					<div className="font-medium">{cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
					<button onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded border px-2 py-1">Next</button>
				</div>
				<CalendarGrid year={year} month={month} datesWithEvents={datesWithEvents} />
			</div>
		</div>
	);
}
