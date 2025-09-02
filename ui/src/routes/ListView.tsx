import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, EventItem } from '@/lib/api-client';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useLocationPreferences } from '@/hooks/useLocationPreferences';
import { haversineMeters, metersToMiles } from '@/lib/location-utils';
import LocationPermissionBanner from '@/components/LocationPermissionBanner';
import NearbyEventsToggle from '@/components/NearbyEventsToggle';
import EventTypeFilter from '@/components/EventTypeFilter';
import { useFilterContext } from './MapIndex';

export default function ListView() {
	const [items, setItems] = useState<EventItem[]>([]);
	const [loading, setLoading] = useState(true);
	const { coords } = useUserLocation();
	const { prefs } = useLocationPreferences();
	const navigate = useNavigate();
	const { selectedEventTypes, setSelectedEventTypes } = useFilterContext();

	const handleEventClick = (event: EventItem) => {
		navigate(`/app/e/${event.id}`);
	};

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			try {
				const data = await api.browse({ range: 90 });
				if (mounted) setItems(data);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => { mounted = false; };
	}, []);

	const sorted = useMemo(() => {
		// First filter by event types
		const typeFiltered = items.filter((item) => {
			if (selectedEventTypes.length === 0) return true;
			return item.eventType && selectedEventTypes.includes(item.eventType);
		});

		if (prefs.nearbyEnabled && coords) {
			const withDistances = typeFiltered.map((it) => {
				const la = it.latitude != null ? Number(it.latitude) : null;
				const lo = it.longitude != null ? Number(it.longitude) : null;
				if (la == null || lo == null) return { ...it, distanceMeters: Number.POSITIVE_INFINITY };
				return { ...it, distanceMeters: haversineMeters(coords.lat, coords.lng, la, lo) };
			});
			return withDistances
				.filter((i) => (i.distanceMeters ?? Infinity) <= prefs.radiusMeters)
				.sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
		}
		return [...typeFiltered].sort((a, b) => {
			const ta = a.startsAtUtc ? new Date(a.startsAtUtc).getTime() : 0;
			const tb = b.startsAtUtc ? new Date(b.startsAtUtc).getTime() : 0;
			return ta - tb;
		});
	}, [items, prefs, coords, selectedEventTypes]);

	return (
		<div className="mx-auto max-w-3xl p-2">
			<div className="space-y-3">
				<EventTypeFilter
					selectedTypes={selectedEventTypes}
					onTypesChange={setSelectedEventTypes}
				/>
				<LocationPermissionBanner />
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">Upcoming</h3>
					<NearbyEventsToggle />
				</div>
				{loading ? (
					<div className="rounded border p-3 text-sm">Loading…</div>
				) : (
					<ul className="divide-y rounded border bg-white dark:bg-gray-900">
						{sorted.map((it) => (
							<li
								key={it.id}
								className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
								onClick={() => handleEventClick(it)}
							>
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<div className="font-medium">{it.name}</div>
										{it.address && (
											<div className="text-xs text-gray-500 mt-1">
												{it.address}
											</div>
										)}
										{it.description && (
											<div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
												{it.description}
											</div>
										)}
										{it.startsAtUtc && (
											<div className="text-xs text-gray-500 mt-1">
												{new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(it.startsAtUtc))}
											</div>
										)}
									</div>
									<div className="flex flex-col items-end gap-1">
										{it.distanceMeters !== undefined && isFinite(it.distanceMeters) && (
											<div className="text-xs text-gray-600 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
												{metersToMiles(it.distanceMeters).toFixed(1)} mi
											</div>
										)}
										{it.eventType && (
											<div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
												{it.eventType}
											</div>
										)}
									</div>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
