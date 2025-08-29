import { useState } from 'react';
import MapboxMap from '@/components/MapboxMap';
import EventTypeFilter from '@/components/EventTypeFilter';

export default function MapView() {
	const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);

	return (
		<div className="flex flex-col h-full">
			<div className="mx-auto max-w-3xl w-full p-2">
				<EventTypeFilter
					selectedTypes={selectedEventTypes}
					onTypesChange={setSelectedEventTypes}
				/>
			</div>
			<div className="flex-1 min-h-0">
				<MapboxMap
					selectedEventTypes={selectedEventTypes}
					className="h-full w-full"
				/>
			</div>
		</div>
	);
}
