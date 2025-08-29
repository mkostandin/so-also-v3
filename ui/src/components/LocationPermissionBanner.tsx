import { useUserLocation } from '@/hooks/useUserLocation';

export default function LocationPermissionBanner() {
	const { status, request, error } = useUserLocation();
	if (status !== 'prompt') return null;
	return (
		<div className="mb-3 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
			<div className="mb-2 font-medium">Enable location for nearby events</div>
			<button
				onClick={request}
				title="Grant location access"
				aria-label="Grant location access"
				className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
			>
				Allow location
			</button>
			{error && <div className="mt-2 text-xs text-red-600">{error}</div>}
		</div>
	);
}
