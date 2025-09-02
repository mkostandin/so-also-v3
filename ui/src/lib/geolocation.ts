export type GeoPermissionState = 'granted' | 'denied' | 'prompt' | 'checking' | 'unsupported';

export async function getPermissionState(): Promise<GeoPermissionState> {
	if (!('permissions' in navigator) || !('geolocation' in navigator)) return 'unsupported';
	try {
		// @ts-ignore
		const status = await navigator.permissions.query({ name: 'geolocation' });
		return (status.state as GeoPermissionState) || 'prompt';
	} catch {
		return 'prompt';
	}
}

export function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
	return new Promise((resolve, reject) => {
		if (!('geolocation' in navigator)) return reject(new Error('Geolocation unsupported'));
		navigator.geolocation.getCurrentPosition(resolve, reject, options);
	});
}
