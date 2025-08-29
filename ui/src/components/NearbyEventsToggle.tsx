import { useLocationPreferences } from '@/hooks/useLocationPreferences';

export default function NearbyEventsToggle() {
	const { prefs, setPrefs } = useLocationPreferences();
	return (
		<div className="flex items-center gap-3">
			<label className="inline-flex cursor-pointer items-center gap-2">
				<input
					type="checkbox"
					checked={prefs.nearbyEnabled}
					onChange={(e) => setPrefs({ ...prefs, nearbyEnabled: e.target.checked })}
					className="h-4 w-4"
				/>
				<span className="text-sm">Show nearby first</span>
			</label>
			<label className="sr-only" htmlFor="radius-select">Radius</label>
			<select
				id="radius-select"
				title="Select radius"
				value={prefs.radiusMeters}
				onChange={(e) => setPrefs({ ...prefs, radiusMeters: parseInt(e.target.value, 10) })}
				className="rounded border px-2 py-1 text-sm"
			>
				<option value={10000}>10 km</option>
				<option value={25000}>25 km</option>
				<option value={50000}>50 km</option>
				<option value={100000}>100 km</option>
			</select>
		</div>
	);
}
