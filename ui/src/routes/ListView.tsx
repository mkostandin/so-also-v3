import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, EventItem } from '@/lib/api-client';
import { useUserLocation } from '@/hooks/useUserLocation';
import { haversineMeters, metersToMiles } from '@/lib/location-utils';
import { formatDateShort, formatTime } from '@/lib/session-utils';
import LocationPermissionBanner from '@/components/LocationPermissionBanner';
import EventTypeFilter from '@/components/EventTypeFilter';
import { useFilterContext } from './MapIndex';

export default function ListView() {
	const [allEvents, setAllEvents] = useState<EventItem[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const { coords, status, request } = useUserLocation();
	const navigate = useNavigate();
	const { selectedEventTypes, setSelectedEventTypes } = useFilterContext();

	const eventsPerPage = 50;

	const handleEventClick = (event: EventItem) => {
		navigate(`/app/e/${event.id}`);
	};

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			try {
				const data = await api.browse({ range: 90 });
				if (mounted) setAllEvents(data || []);
			} catch (error) {
				console.error('Failed to fetch events:', error);
				if (mounted) setAllEvents([]);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => { mounted = false; };
	}, []);

	// Auto-request location when no coords available
	useEffect(() => {
		if (!coords && status === 'prompt') {
			request();
		}
	}, [coords, status, request]);

	// Calculate displayed events based on pagination and location
	const { displayedEvents, totalEvents, hasMoreEvents } = useMemo(() => {
		// First filter by event types (only if we have specific types selected)
		let filtered = allEvents;

		// Only filter by event type if we have specific types selected (not all types)
		if (selectedEventTypes.length > 0 && selectedEventTypes.length < 5) {
			filtered = allEvents.filter((item) => {
				return item.eventType && selectedEventTypes.includes(item.eventType);
			});
		}

		// Sort by distance if we have coordinates, otherwise by time
		let sortedEvents: (EventItem & { distanceMeters?: number })[];

		if (coords) {
			// Calculate distances and sort by proximity
			sortedEvents = filtered
				.filter(event => event.latitude != null && event.longitude != null) // Only events with coordinates
				.map(event => ({
					...event,
					distanceMeters: haversineMeters(
						coords.lat,
						coords.lng,
						Number(event.latitude),
						Number(event.longitude)
					)
				}))
				.sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));

			// Add events without coordinates at the end
			const eventsWithoutCoords = filtered.filter(event =>
				event.latitude == null || event.longitude == null
			);
			sortedEvents = [...sortedEvents, ...eventsWithoutCoords];
		} else {
			// No coordinates available, sort by time
			sortedEvents = [...filtered].sort((a, b) => {
				const ta = a.startsAtUtc ? new Date(a.startsAtUtc).getTime() : 0;
				const tb = b.startsAtUtc ? new Date(b.startsAtUtc).getTime() : 0;
				return ta - tb;
			});
		}

		// Apply pagination
		const endIndex = page * eventsPerPage;
		const displayedEvents = sortedEvents.slice(0, endIndex);
		const hasMoreEvents = sortedEvents.length > endIndex;

		return {
			displayedEvents,
			totalEvents: sortedEvents.length,
			hasMoreEvents
		};
	}, [allEvents, selectedEventTypes, coords, page]);

	const handleLoadMore = () => {
		setIsLoadingMore(true);
		// Simulate loading delay for better UX
		setTimeout(() => {
			setPage(prev => prev + 1);
			setIsLoadingMore(false);
		}, 300);
	};

	// Show location permission banner if no coordinates and permission was denied
	if (!coords && status === 'denied') {
		return (
			<div className="mx-auto max-w-3xl p-2">
				<div className="space-y-3">
					<EventTypeFilter
						selectedTypes={selectedEventTypes}
						onTypesChange={setSelectedEventTypes}
					/>
					<div className="text-center py-12">
						<div className="text-gray-500 mb-4">
							<svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							<h3 className="text-lg font-medium text-gray-900 mb-2">Location Required</h3>
							<p className="text-sm">Enable location to see events sorted by distance from you.</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl p-2">
			<div className="space-y-3">
				<EventTypeFilter
					selectedTypes={selectedEventTypes}
					onTypesChange={setSelectedEventTypes}
				/>
				{!coords && status === 'prompt' && <LocationPermissionBanner />}

				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">
						{coords ? 'Events by Distance' : 'Upcoming Events'}
						{displayedEvents.length > 0 && (
							<span className="text-sm font-normal text-gray-500 ml-2">
								({displayedEvents.length}{hasMoreEvents ? ` of ${totalEvents}` : ''})
							</span>
						)}
					</h3>
				</div>

				{loading ? (
					<div className="rounded border p-3 text-sm">Loading…</div>
				) : displayedEvents.length === 0 ? (
					<div className="rounded border p-3 text-sm text-gray-500">
						{allEvents.length === 0
							? "No events available"
							: "No events match your filters"}
					</div>
				) : (
					<>
						<div className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
							<ul className="divide-y rounded border bg-white dark:bg-gray-900">
								{displayedEvents.map((event) => (
									<li
										key={event.id}
										className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
										onClick={() => handleEventClick(event)}
									>
										<div className="flex items-center justify-between">
											<div className="flex-1">
												<div className="font-medium">{event.name}</div>
												{event.address && (
													<div className="text-xs text-gray-500 mt-1">
														{event.address}
													</div>
												)}
												{event.description && (
													<div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
														{event.description}
													</div>
												)}
												{event.startsAtUtc && (
													<div className="text-xs text-gray-500 mt-1">
														{formatDateShort(event.startsAtUtc)} • {formatTime(event.startsAtUtc)}
													</div>
												)}
											</div>
											<div className="flex flex-col items-end gap-1">
												{coords && event.distanceMeters !== undefined && isFinite(event.distanceMeters) && (
													<div className="text-xs text-gray-600 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
														{metersToMiles(event.distanceMeters).toFixed(1)} mi
													</div>
												)}
												{event.eventType && (
													<div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
														{event.eventType}
													</div>
												)}
											</div>
										</div>
									</li>
								))}
							</ul>
						</div>

						{hasMoreEvents && (
							<div className="flex justify-center mt-6">
								<button
									onClick={handleLoadMore}
									disabled={isLoadingMore}
									className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{isLoadingMore ? (
										<span className="flex items-center gap-2">
											<svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Loading...
										</span>
									) : (
										`Load More Events (${totalEvents - displayedEvents.length} remaining)`
									)}
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
