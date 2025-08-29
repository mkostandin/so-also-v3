import { useLocationPreferences } from '@/hooks/useLocationPreferences';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function NearbyEventsToggle() {
	const { prefs, setPrefs } = useLocationPreferences();
	return (
		<div className="flex items-center gap-3">
			<label htmlFor="nearby-switch" className="text-sm">Show nearby first</label>
			<Switch id="nearby-switch" checked={prefs.nearbyEnabled} onCheckedChange={(v) => setPrefs({ ...prefs, nearbyEnabled: v })} />
			<label className="sr-only" htmlFor="radius-select">Radius</label>
			<Select value={String(prefs.radiusMeters)} onValueChange={(v) => setPrefs({ ...prefs, radiusMeters: parseInt(v, 10) })}>
				<SelectTrigger id="radius-select" className="w-[120px]">
					<SelectValue placeholder="Radius" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="10000">10 km</SelectItem>
					<SelectItem value="25000">25 km</SelectItem>
					<SelectItem value="50000">50 km</SelectItem>
					<SelectItem value="100000">100 km</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
