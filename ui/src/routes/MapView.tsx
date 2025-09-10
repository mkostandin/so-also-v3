import { useState, useEffect, useRef, useCallback } from 'react';
import MapboxMap from '@/components/MapboxMap';
import { useFilterContext } from './MapIndex';
import { isRecoverableError, getErrorMessage } from '@/lib/mapbox';

// Network-aware timeout calculation with browser compatibility
const getTimeoutDuration = () => {
	// Base timeout: 30s (reasonable for most connections)
	const baseTimeout = 30000;

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

	// Define Network Information API types
	interface NetworkConnection {
		effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
	}

	// Get connection object with fallbacks
	const connection = (navigator as { connection?: NetworkConnection }).connection ||
	                  (navigator as { mozConnection?: NetworkConnection }).mozConnection ||
	                  (navigator as { webkitConnection?: NetworkConnection }).webkitConnection;

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
			return 25000; // Faster on 4G
		case '3g':
			return 35000; // Standard timeout
		case '2g':
		case 'slow-2g':
			return 60000; // Much longer for slow connections
		default:
			return baseTimeout;
	}
};



export default function MapView() {
	const { selectedEventTypes, selectedCommittees } = useFilterContext();
	const [mapLoadTimeout, setMapLoadTimeout] = useState(false);
	const [retryCount, setRetryCount] = useState(0);
	const [isRetrying, setIsRetrying] = useState(false);
	const maxRetries = 2;
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastProgressRef = useRef<number>(Date.now());

	// Handle retry logic
	const handleRetry = useCallback(() => {
		if (retryCount < maxRetries) {
			setRetryCount(prev => prev + 1);
			setIsRetrying(true);
			setMapLoadTimeout(false);
		} else {
			setMapLoadTimeout(true);
		}
	}, [retryCount, maxRetries]);

	// Reset timeout on progress
	const resetTimeout = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		lastProgressRef.current = Date.now();
	}, []);

	// Memoized callback functions to prevent infinite re-renders
	const handleMapReady = useCallback(() => {
		// Cancel timeout, clear loading state
		setMapLoadTimeout(false);
		setIsRetrying(false);
	}, [setMapLoadTimeout, setIsRetrying]);

	const handleMapError = useCallback((error: Error) => {
		// Classify error and decide whether to retry
		if (isRecoverableError(error)) {
			handleRetry();
		} else {
			setMapLoadTimeout(true);
		}
	}, [handleRetry, setMapLoadTimeout]);

	const handleMapProgress = useCallback(() => {
		// Reset timeout on progress
		resetTimeout();
	}, [resetTimeout]);

	useEffect(() => {
		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Get network-aware timeout duration
		const timeout = getTimeoutDuration();
		const timeoutSeconds = Math.round(timeout / 1000);

		// Set new timeout that can be reset by progress events
		timeoutRef.current = setTimeout(() => {
			// Clear loading state and show fallback
			setMapLoadTimeout(true);

			const errorMessage = `Map failed to load after ${maxRetries + 1} attempts. Please check your connection and try again.`;
		}, timeout);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [retryCount, maxRetries, isRetrying]);

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
						The interactive map couldn't load. This can happen due to slow connections, network issues, or browser limitations. Please try again or check your connection.
					</p>
					<div className="space-y-2">
						<button
							onClick={() => {
								setMapLoadTimeout(false);
								setRetryCount(0);
								setIsRetrying(false);
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
		<div className="mx-auto max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[calc(100vh-180px)] flex flex-col" data-loaded="true">
			{/* Height optimization: calc(100vh-180px) accounts for: */}
			{/* - Header: ~64px */}
			{/* - Fixed global filters: ~56px (at top-[72px]) */}
			{/* - Distance filter in calendar view: ~70px below global filters (including mt-1 margin) */}
			{/* - Bottom tabs: ~50px */}
			{/* - mt-8 spacing: ~32px */}
			{/* - Total: ~272px (using 180px for conservative spacing to prevent overlap) */}
			{/* Map container with proper height and responsive corner styling */}
			<div className="flex-1 relative z-0 mt-8">
				<MapboxMap
					selectedEventTypes={selectedEventTypes}
					selectedCommittees={selectedCommittees} // Pass committee filter to map for real-time filtering
					className="h-full w-full rounded-none md:rounded-lg"
					onReady={handleMapReady}
					onError={handleMapError}
					onProgress={handleMapProgress}
				/>
			</div>
		</div>
	);
}
