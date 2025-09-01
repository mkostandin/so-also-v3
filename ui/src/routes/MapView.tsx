import { useState, useEffect } from 'react';
import MapboxMap from '@/components/MapboxMap';
import EventTypeFilter, { EVENT_TYPES } from '@/components/EventTypeFilter';
import { useMobileDebug } from '@/hooks/useMobileDebug';

export default function MapView() {
	const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([...EVENT_TYPES]);
	const [mapLoadTimeout, setMapLoadTimeout] = useState(false);
	const { logAction, setLoading, setError, isMobile } = useMobileDebug();

	useEffect(() => {
		logAction('MapView component mounted');
		setLoading(true, 'Loading map...');

		// Set a timeout for map loading (30 seconds on mobile, 10 on desktop)
		const timeout = isMobile ? 30000 : 10000;
		const timer = setTimeout(() => {
			if (isMobile) {
				logAction('Map load timeout - showing fallback');
				setMapLoadTimeout(true);
				setError('Map failed to load within 30 seconds. This is common on mobile devices.');
			}
		}, timeout);

		return () => {
			clearTimeout(timer);
			setLoading(false, 'MapView unmounted');
		};
	}, [isMobile, logAction, setLoading, setError]);

	// Simple fallback UI for when map fails on mobile
	if (mapLoadTimeout && isMobile) {
		return (
			<div className="flex flex-col h-full items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
				<div className="text-center max-w-md">
					<div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
						Map Loading Issue
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						The interactive map couldn't load on your device. This is common with mobile browsers due to memory or compatibility limitations.
					</p>
					<div className="space-y-2">
						<button
							onClick={() => {
								setMapLoadTimeout(false);
								setError('');
								logAction('Retrying map load');
								window.location.reload();
							}}
							className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
						>
							Try Again
						</button>
						<button
							onClick={() => {
								setMapLoadTimeout(false);
								setError('');
								logAction('Switching to list view');
								window.location.href = '/app/map/list';
							}}
							className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
						>
							Use List View Instead
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full" data-loaded="true">
			<div className="mx-auto max-w-3xl w-full p-2">
				<EventTypeFilter
					selectedTypes={selectedEventTypes}
					onTypesChange={setSelectedEventTypes}
				/>
			</div>
			<div className="flex-1 min-h-0">
				<MapboxMap
					selectedEventTypes={selectedEventTypes}
					className="h-full w-full"
				/>
			</div>
		</div>
	);
}
