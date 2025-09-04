import { useState, useEffect, useRef, useCallback } from 'react';
import MapboxMap from '@/components/MapboxMap';
import EventTypeFilter from '@/components/EventTypeFilter';
import CommitteeFilter from '@/components/CommitteeFilter';
import { useMobileDebug } from '@/hooks/useMobileDebug';
import { useFilterContext } from './MapIndex';
import { isRecoverableError, getErrorMessage } from '@/lib/mapbox';

// Network-aware timeout calculation with browser compatibility
const getTimeoutDuration = (isMobile: boolean) => {
	// Base timeouts: mobile 60s, desktop 25s
	const baseTimeout = isMobile ? 60000 : 25000;

	// Check for Network Information API support
	const hasNetworkInfo = 'connection' in navigator ||
	                      'mozConnection' in navigator ||
	                      'webkitConnection' in navigator;

	if (!hasNetworkInfo) {
		// Fallback: use basic connectivity check
		const isOnline = navigator.onLine;
		if (!isOnline) {
			return 120000; // 2 minutes for offline scenarios
		}
		return baseTimeout;
	}

	// Get connection object with fallbacks
	const connection = (navigator as any).connection ||
	                  (navigator as any).mozConnection ||
	                  (navigator as any).webkitConnection;

	if (!connection || !connection.effectiveType) {
		// No effectiveType available, use basic online check
		const isOnline = navigator.onLine;
		if (!isOnline) {
			return 120000; // 2 minutes for offline scenarios
		}
		return baseTimeout;
	}

	// Adjust timeout based on connection speed
	switch (connection.effectiveType) {
		case '4g':
			return isMobile ? 45000 : 20000; // Faster on 4G
		case '3g':
			return isMobile ? 60000 : 25000; // Standard timeouts
		case '2g':
		case 'slow-2g':
			return 90000; // Much longer for slow connections
		default:
			return baseTimeout;
	}
};



export default function MapView() {
	const { selectedEventTypes, setSelectedEventTypes, selectedCommittees, setSelectedCommittees } = useFilterContext();
	const [mapLoadTimeout, setMapLoadTimeout] = useState(false);
	const [retryCount, setRetryCount] = useState(0);
	const [isRetrying, setIsRetrying] = useState(false);
	const maxRetries = 2;
	const { logAction, setLoading, setError, isMobile } = useMobileDebug();
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastProgressRef = useRef<number>(Date.now());

	// Handle retry logic
	const handleRetry = useCallback(() => {
		if (retryCount < maxRetries) {
			logAction(`Attempting retry ${retryCount + 1}/${maxRetries}`);
			setRetryCount(prev => prev + 1);
			setIsRetrying(true);
			setMapLoadTimeout(false);
			setError('');
			setLoading(true, `Retrying map load... (${retryCount + 1}/${maxRetries})`);
		} else {
			logAction('Max retries reached - showing fallback');
			setMapLoadTimeout(true);
			setLoading(false);
			setError(`Map failed to load after ${maxRetries + 1} attempts. Please try again.`);
		}
	}, [retryCount, maxRetries, logAction, setLoading, setError]);

	// Reset timeout on progress
	const resetTimeout = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		lastProgressRef.current = Date.now();
		logAction('Timeout reset due to map progress');
	}, [logAction]);

	// Memoized callback functions to prevent infinite re-renders
	const handleMapReady = useCallback(() => {
		// Cancel timeout, clear loading state
		setMapLoadTimeout(false);
		setIsRetrying(false);
		setLoading(false, 'Map loaded successfully');
		logAction('Map ready - canceling timeout and clearing loading state');
	}, [setMapLoadTimeout, setIsRetrying, setLoading, logAction]);

	const handleMapError = useCallback((error: Error) => {
		// Classify error and decide whether to retry
		logAction(`Map error received: ${error.message}`);
		if (isRecoverableError(error)) {
			handleRetry();
		} else {
			setMapLoadTimeout(true);
			setError(getErrorMessage(error));
		}
	}, [handleRetry, setMapLoadTimeout, setError, logAction]);

	const handleMapProgress = useCallback(() => {
		// Reset timeout on progress
		logAction('Map progress detected - resetting timeout');
		resetTimeout();
	}, [logAction, resetTimeout]);

	useEffect(() => {
		logAction(`MapView component mounted (retry: ${retryCount}/${maxRetries})`);

		// Update loading message based on retry status
		const loadingMessage = isRetrying
			? `Retrying map load... (${retryCount}/${maxRetries})`
			: retryCount > 0
			? `Loading map... (attempt ${retryCount + 1})`
			: 'Loading map...';

		setLoading(true, loadingMessage);

		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Get network-aware timeout duration
		const timeout = getTimeoutDuration(isMobile);
		const timeoutSeconds = Math.round(timeout / 1000);

		logAction(`Setting map timeout: ${timeoutSeconds}s (mobile: ${isMobile})`);

		// Set new timeout that can be reset by progress events
		timeoutRef.current = setTimeout(() => {
			logAction(`Map load timeout after ${timeoutSeconds}s - showing fallback`);

			// Clear loading state and show fallback
			setLoading(false);
			setMapLoadTimeout(true);

			const errorMessage = isMobile
				? `Map failed to load after ${maxRetries + 1} attempts. This is common on mobile devices with slow connections.`
				: `Map failed to load after ${maxRetries + 1} attempts. Please check your connection and try again.`;

			setError(errorMessage);
		}, timeout);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			setLoading(false, 'MapView unmounted');
		};
	}, [isMobile, logAction, setLoading, setError, retryCount, maxRetries]);

	// Simple fallback UI for when map fails to load
	if (mapLoadTimeout) {
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
						The interactive map couldn't load. This can happen due to slow connections, network issues, or browser limitations. {isMobile ? 'This is common on mobile devices.' : 'Please try again or check your connection.'}
					</p>
					<div className="space-y-2">
						<button
							onClick={() => {
								setMapLoadTimeout(false);
								setError('');
								setRetryCount(0);
								setIsRetrying(false);
								logAction('Manual retry initiated');
								// Reset progress timestamp for new attempt
								lastProgressRef.current = Date.now();
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
			<div className="mx-auto max-w-3xl w-full">
				<EventTypeFilter
					selectedTypes={selectedEventTypes}
					onTypesChange={setSelectedEventTypes}
				/>
				<CommitteeFilter
					selectedCommittees={selectedCommittees}
					onCommitteesChange={setSelectedCommittees}
				/>
			</div>
			<div className="flex-1 min-h-0 relative z-0">
				<MapboxMap
					selectedEventTypes={selectedEventTypes}
					className="h-full w-full"
					onReady={handleMapReady}
					onError={handleMapError}
					onProgress={handleMapProgress}
				/>
			</div>
		</div>
	);
}
