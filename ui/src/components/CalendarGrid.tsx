import CalendarEventIndicator from './CalendarEventIndicator';

export default function CalendarGrid({ year, month, datesWithEvents }: { year: number; month: number; datesWithEvents: Set<number> }) {
	const first = new Date(year, month, 1);
	const startDay = first.getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const cells = [] as any[];
	for (let i = 0; i < startDay; i++) cells.push(null);
	for (let d = 1; d <= daysInMonth; d++) cells.push(d);
	while (cells.length % 7 !== 0) cells.push(null);
	return (
		<div className="grid grid-cols-7 gap-1">
			{['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
				<div key={d} className="p-1 text-center text-xs text-gray-500">{d}</div>
			))}
			{cells.map((d, idx) => (
				<div key={idx} className={`min-h-[48px] rounded border p-1 ${d ? '' : 'bg-gray-50 dark:bg-gray-800'}`}>
					{d && (
						<div className="flex items-center justify-between text-xs">
							<span>{d}</span>
							{datesWithEvents.has(d) && <CalendarEventIndicator />}
						</div>
					)}
				</div>
			))}
		</div>
	);
}
