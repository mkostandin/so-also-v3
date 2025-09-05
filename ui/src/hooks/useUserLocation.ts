import { useEffect, useState, useCallback } from 'react';
import { getPermissionState, getCurrentPosition, GeoPermissionState } from '@/lib/geolocation';

export function useUserLocation() {
	const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
	const [status, setStatus] = useState<GeoPermissionState>('checking');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		// Check permission state and update status
		getPermissionState().then((permissionState) => {
			console.log('[Location Debug] Permission state:', permissionState);
			if (mounted) {
				setStatus(permissionState);
			}
		}).catch((error) => {
			console.log('[Location Debug] Permission check failed:', error);
			// If permission check fails, assume prompt state
			if (mounted) {
				setStatus('prompt');
			}
		});

		return () => {
			mounted = false;
		};
	}, []);

	const request = useCallback(async () => {
		try {
			console.log('[Location Debug] Requesting user location...');
			const pos = await getCurrentPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
			console.log('[Location Debug] Location obtained:', pos.coords.latitude, pos.coords.longitude);
			setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
			setStatus('granted');
		} catch (e: any) {
			console.error('[Location Debug] Location error:', e?.message || 'Unknown error');
			setError(e?.message || 'Location error');
			setStatus('denied');
		}
	}, []);

	return { coords, status, error, request };
}
