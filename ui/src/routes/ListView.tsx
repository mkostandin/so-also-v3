import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventItem } from '@/lib/api-client';
import { useUserLocation } from '@/hooks/useUserLocation';
import { haversineMeters, metersToMiles } from '@/lib/location-utils';
import { formatDateShort, formatTime } from '@/lib/session-utils';
import LocationPermissionBanner from '@/components/LocationPermissionBanner';
import EventTypeFilter from '@/components/EventTypeFilter';
import CommitteeFilter from '@/components/CommitteeFilter';
import EventListSkeleton from '@/components/EventListSkeleton';
import { useFilterContext } from './MapIndex';

export default function ListView() {
	const [page, setPage] = useState(1);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [showSkeleton, setShowSkeleton] = useState(true);
	const { coords, status, request } = useUserLocation();
	const navigate = useNavigate();
	const { selectedEventTypes, setSelectedEventTypes, selectedCommittees, setSelectedCommittees, events, eventsLoading } = useFilterContext();



	const eventsPerPage = 50;

	const handleEventClick = (event: EventItem) => {
		navigate(`/app/e/${event.id}`);
	};

	// Events are now loaded once at the MapIndex level and shared via context
	// No need for individual API calls in each view component

	// Auto-request location when no coords available
	// Ensures list view uses user's actual location for better event relevance
	useEffect(() => {
		if (!coords && (status === 'prompt' || status === 'granted')) {
			request();
		}
	}, [coords, status, request]);


	// Calculate displayed events based on pagination and location
	const { displayedEvents, totalEvents, hasMoreEvents } = useMemo(() => {
		// First filter by event types (only if we have specific types selected)
		let filtered = events;

		// Only filter by event type if we have specific types selected (not all types)
		if (selectedEventTypes.length > 0 && selectedEventTypes.length < 5) {
			filtered = events.filter((item) => {
				return item.eventType && selectedEventTypes.includes(item.eventType);
			});
		}

		// Sort by distance if we have coordinates, otherwise by time
		let sortedEvents: (EventItem & { distanceMeters?: number })[];

		if (coords) {
			// Calculate distances and sort by proximity
			const eventsWithCoords = filtered.filter(event => event.latitude != null && event.longitude != null);
			const eventsWithoutCoords = filtered.filter(event => event.latitude == null || event.longitude == null);

			sortedEvents = eventsWithCoords
				.map(event => ({
					...event,
					// Only calculate distance if not already provided by API
					distanceMeters: event.distanceMeters ?? haversineMeters(
						coords.lat,
						coords.lng,
						Number(event.latitude),
						Number(event.longitude)
					)
				}))
				.sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));

			// Add events without coordinates at the end
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
	}, [events, selectedEventTypes, coords, page]);

	// Simple skeleton management
	useEffect(() => {
		if (eventsLoading) {
			setShowSkeleton(true);
		} else {
			// Hide skeleton when loading is complete, regardless of event count
			const timer = setTimeout(() => setShowSkeleton(false), 100);
			return () => clearTimeout(timer);
		}
	}, [eventsLoading]);

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
			<div className="mx-auto max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
				<div className="space-y-2">
					<EventTypeFilter
						selectedTypes={selectedEventTypes}
						onTypesChange={setSelectedEventTypes}
					/>
					<CommitteeFilter
						selectedCommittees={selectedCommittees}
						onCommitteesChange={setSelectedCommittees}
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
		<div className="mx-auto max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-full flex flex-col min-h-0">
			<div className="sticky top-0 z-40 bg-white dark:bg-gray-900 space-y-2 border-b">
				<EventTypeFilter
					selectedTypes={selectedEventTypes}
					onTypesChange={setSelectedEventTypes}
				/>
				<CommitteeFilter
					selectedCommittees={selectedCommittees}
					onCommitteesChange={setSelectedCommittees}
				/>
				{!coords && status === 'prompt' && <LocationPermissionBanner />}
			</div>

			<div className="flex-1 min-h-0 overflow-y-auto">
				{showSkeleton ? (
					<EventListSkeleton />
				) : displayedEvents.length === 0 ? (
					<div className="h-full rounded border p-3 text-sm text-gray-500 flex items-center justify-center">
						{events.length === 0
							? "No events available"
							: "No events match your filters"}
					</div>
				) : (
					<>
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
											{event.description && (
												<div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
													{event.description}
												</div>
											)}
											{/* Address line removed to reduce vertical space per event item */}
											{event.startsAtUtc && (
												<div className="text-xs text-gray-500 mt-1">
													{formatDateShort(event.startsAtUtc)} • {formatTime(event.startsAtUtc)}
												</div>
											)}
										</div>
										<div className="flex flex-col items-end gap-1">
											{/* Enhanced distance badge with location icon for visual clarity */}
											{coords && event.distanceMeters !== undefined && isFinite(event.distanceMeters) && (
												<div className="text-xs text-gray-600 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
													{/* Location pin icon uses currentColor for dark mode support */}
													<svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
													</svg>
													{metersToMiles(event.distanceMeters).toFixed(1)} mi
												</div>
											)}
											{event.eventType && (
												<div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
													{event.eventType}
												</div>
											)}
											{/* Committee tag with truncation and lighter blue styling for visual differentiation */}
											{event.committee && (
												<div className="text-xs bg-blue-100/50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded truncate max-w-[120px]">
													{/* Truncate committee names longer than 15 characters with ellipsis */}
													{event.committee.length > 15 ? `${event.committee.substring(0, 15)}...` : event.committee}
												</div>
											)}
										</div>
									</div>
								</li>
							))}
						</ul>

						{hasMoreEvents && (
							<div className="flex justify-center mt-6">
								{isLoadingMore ? (
									<div className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
										<div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
									</div>
								) : (
									<button
										onClick={handleLoadMore}
										className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
									>
										Load More Events ({totalEvents - displayedEvents.length} remaining)
									</button>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
