export default function EventTimeSlot({ title, time }: { title: string; time: string }) {
	return (
		<div className="rounded border p-2 text-xs">
			<div className="font-medium">{title}</div>
			<div className="text-gray-600">{time}</div>
		</div>
	);
}
