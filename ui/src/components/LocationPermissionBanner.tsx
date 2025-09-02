import { useUserLocation } from '@/hooks/useUserLocation';

export default function LocationPermissionBanner() {
	const { status, request, error } = useUserLocation();
	if (status !== 'prompt') return null;
	return (
		<div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
			<div className="flex items-center gap-3">
				<svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				<div className="flex-1">
					<div className="font-medium mb-1">Enable location for distance sorting</div>
					<p className="text-xs opacity-90">See events sorted by distance from your location</p>
				</div>
				<button
					onClick={request}
					title="Grant location access"
					aria-label="Grant location access"
					className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors font-medium"
				>
					Allow location
				</button>
			</div>
			{error && <div className="mt-2 text-xs text-red-600">{error}</div>}
		</div>
	);
}
