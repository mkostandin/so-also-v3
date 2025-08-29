import { useEffect, useMemo, useState } from 'react';
import { api, EventItem } from '@/lib/api-client';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useLocationPreferences } from '@/hooks/useLocationPreferences';
import { haversineMeters, metersToMiles } from '@/lib/location-utils';
import LocationPermissionBanner from '@/components/LocationPermissionBanner';
import NearbyEventsToggle from '@/components/NearbyEventsToggle';

export default function ListView() {
	const [items, setItems] = useState<EventItem[]>([]);
	const [loading, setLoading] = useState(true);
	const { coords } = useUserLocation();
	const { prefs } = useLocationPreferences();

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
		if (prefs.nearbyEnabled && coords) {
			const withDistances = items.map((it) => {
				const la = it.latitude != null ? Number(it.latitude) : null;
				const lo = it.longitude != null ? Number(it.longitude) : null;
				if (la == null || lo == null) return { ...it, distanceMeters: Number.POSITIVE_INFINITY };
				return { ...it, distanceMeters: haversineMeters(coords.lat, coords.lng, la, lo) };
			});
			return withDistances
				.filter((i) => (i.distanceMeters ?? Infinity) <= prefs.radiusMeters)
				.sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
		}
		return [...items].sort((a, b) => {
			const ta = a.startsAtUtc ? new Date(a.startsAtUtc).getTime() : 0;
			const tb = b.startsAtUtc ? new Date(b.startsAtUtc).getTime() : 0;
			return ta - tb;
		});
	}, [items, prefs, coords]);

	return (
		<div className="space-y-3">
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
						<li key={it.id} className="p-3">
							<div className="flex items-center justify-between">
								<div>
									<div className="font-medium">{it.name}</div>
									{it.startsAtUtc && (
										<div className="text-xs text-gray-500">{new Date(it.startsAtUtc).toLocaleString()}</div>
									)}
								</div>
								{it.distanceMeters !== undefined && isFinite(it.distanceMeters) && (
									<div className="text-xs text-gray-600">{metersToMiles(it.distanceMeters).toFixed(1)} mi</div>
								)}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
