export default function CalendarNavigation({ monthLabel, onPrev, onNext }: { monthLabel: string; onPrev: () => void; onNext: () => void }) {
	return (
		<div className="mb-2 flex items-center justify-between">
			<button onClick={onPrev} className="rounded border px-2 py-1">Prev</button>
			<div className="font-medium">{monthLabel}</div>
			<button onClick={onNext} className="rounded border px-2 py-1">Next</button>
		</div>
	);
}
