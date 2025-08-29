import { useState } from 'react';
import MapboxMap from '@/components/MapboxMap';
import EventTypeFilter from '@/components/EventTypeFilter';

export default function MapView() {
	const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);

	return (
		<div className="h-full flex flex-col">
			<EventTypeFilter
				selectedTypes={selectedEventTypes}
				onTypesChange={setSelectedEventTypes}
			/>
			<div className="flex-1 min-h-0">
				<MapboxMap
					selectedEventTypes={selectedEventTypes}
					className="h-full"
				/>
			</div>
		</div>
	);
}
