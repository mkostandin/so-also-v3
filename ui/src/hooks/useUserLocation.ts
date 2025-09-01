import { useEffect, useState, useCallback } from 'react';
import { getPermissionState, getCurrentPosition, GeoPermissionState } from '@/lib/geolocation';

export function useUserLocation() {
	const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
	const [status, setStatus] = useState<GeoPermissionState>('prompt');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		getPermissionState().then((s) => mounted && setStatus(s));
		return () => {
			mounted = false;
		};
	}, []);

	const request = useCallback(async () => {
		try {
			const pos = await getCurrentPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
			setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
			setStatus('granted');
		} catch (e: any) {
			setError(e?.message || 'Location error');
			setStatus('denied');
		}
	}, []);

	return { coords, status, error, request };
}
