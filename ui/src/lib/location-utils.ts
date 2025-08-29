export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const toRad = (d: number) => (d * Math.PI) / 180;
	const R = 6371000;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

export function metersToMiles(m: number): number {
	return m / 1609.344;
}

export function formatDistanceMiles(meters: number | null | undefined, precision: number = 1): string {
	if (meters === null || meters === undefined) return '';

	const miles = metersToMiles(meters);
	if (miles < 0.1) {
		return '< 0.1 mi';
	} else if (miles < 1) {
		return `${miles.toFixed(1)} mi`;
	} else if (miles < 10) {
		return `${miles.toFixed(precision)} mi`;
	} else {
		return `${Math.round(miles)} mi`;
	}
}

export function formatDistanceMilesWithFallback(
	meters: number | null | undefined,
	fallback: string = 'Distance unknown'
): string {
	if (meters === null || meters === undefined) return fallback;
	return formatDistanceMiles(meters);
}