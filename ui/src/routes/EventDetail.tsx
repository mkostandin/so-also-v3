import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, EventItem } from '@/lib/api-client';
import FlagButton from '@/components/FlagButton';
import ImageGallery from '@/components/ImageGallery';
import { metersToMiles } from '@/lib/location-utils';

export default function EventDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [event, setEvent] = useState<EventItem | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!id) return;

		const fetchEvent = async () => {
			try {
				setLoading(true);
				// Get all events and find the one with matching ID
				const events = await api.browse({ range: 365 }); // Get events for the next year
				const foundEvent = events.find(e => e.id === id);

				if (foundEvent) {
					setEvent(foundEvent);
				} else {
					setError('Event not found');
				}
			} catch (err) {
				setError('Failed to load event details');
				console.error('Error fetching event:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchEvent();
	}, [id]);

	const handleBack = () => {
		if (window.history.length > 1) navigate(-1);
		else navigate('/app/map/list');
	};

	const shareUrl = () => {
		const url = new URL(window.location.origin);
		url.pathname = `/app/e/${id}`;
		return url.toString();
	};

	const handleShare = async () => {
		try {
			const url = shareUrl();
			if (navigator.share) {
				await navigator.share({
					title: event?.name || 'Event',
					text: event?.description || undefined,
					url,
				});
			} else if (navigator.clipboard) {
				await navigator.clipboard.writeText(url);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}
		} catch {}
	};

	const handleDirections = () => {
		if (!event) return;
		const hasCoords = event.latitude != null && event.longitude != null;
		let href = '';
		if (hasCoords) {
			href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(String(event.latitude))},${encodeURIComponent(String(event.longitude))}`;
		} else if (event.address) {
			href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`;
		}
		if (href) window.open(href, '_blank', 'noopener');
	};

	if (loading) {
		return (
			<div className="space-y-3">
				<button onClick={handleBack} className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
					Back to List
				</button>
				<div className="flex items-center justify-center p-8">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
						<p className="text-sm text-gray-600 dark:text-gray-400">Loading event details...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !event) {
		return (
			<div className="space-y-3">
				<button onClick={handleBack} className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
					Back to List
				</button>
				<div className="text-center p-8">
					<p className="text-red-600 dark:text-red-400">{error || 'Event not found'}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<button onClick={handleBack} className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
				Back to List
			</button>

			<div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
				<div className="flex items-start justify-between mb-4">
					<div className="flex-1">
						<h1 className="text-2xl font-bold mb-2">{event.name}</h1>
						{event.eventType && (
							<span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full mb-3">
								{event.eventType}
							</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						<button onClick={handleShare} className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
							Share
						</button>
						<button onClick={handleDirections} className="bg-gray-900 text-white px-3 py-2 rounded text-sm hover:bg-black/80 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
							Get Directions
						</button>
						<FlagButton targetType="event" targetId={event.id} committeeSlug={event.committee} />
					</div>
				</div>

				{copied && (
					<div className="mb-3 text-xs text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-300 px-3 py-2 rounded">
						Link copied to clipboard
					</div>
				)}

				{event.description && (
					<div className="mb-4">
						<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
						<p className="text-gray-700 dark:text-gray-300 leading-relaxed">{event.description}</p>
					</div>
				)}

				{event.imageUrls && event.imageUrls.length > 0 && (
					<div className="mb-6">
						<ImageGallery images={event.imageUrls} />
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Date & Time</h3>
						{event.startsAtUtc && (
							<p className="text-gray-700 dark:text-gray-300">
								<strong>Starts:</strong> {new Date(event.startsAtUtc).toLocaleString()}
							</p>
						)}
						{event.endsAtUtc && (
							<p className="text-gray-700 dark:text-gray-300">
								<strong>Ends:</strong> {new Date(event.endsAtUtc).toLocaleString()}
							</p>
						)}
					</div>

					{(event.address || event.city || event.stateProv) && (
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Location</h3>
							{event.address && (
								<p className="text-gray-700 dark:text-gray-300">{event.address}</p>
							)}
							{(event.city || event.stateProv) && (
								<p className="text-gray-700 dark:text-gray-300">
									{[event.city, event.stateProv].filter(Boolean).join(', ')}
								</p>
							)}
							{event.distanceMeters !== undefined && isFinite(event.distanceMeters) && (
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
									{metersToMiles(event.distanceMeters).toFixed(1)} miles away
								</p>
							)}
						</div>
					)}
				</div>

				{(event.committee || event.contactEmail || event.contactPhone) && (
					<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
						<h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
						<div className="space-y-2">
							{event.committee && (
								<p className="text-gray-700 dark:text-gray-300">
									<strong>Committee:</strong> {event.committee}
								</p>
							)}
							{event.contactEmail && (
								<p className="text-gray-700 dark:text-gray-300">
									<strong>Email:</strong>{' '}
									<a
										href={`mailto:${event.contactEmail}`}
										className="text-blue-600 dark:text-blue-400 hover:underline"
									>
										{event.contactEmail}
									</a>
								</p>
							)}
							{event.contactPhone && (
								<p className="text-gray-700 dark:text-gray-300">
									<strong>Phone:</strong>{' '}
									<a
										href={`tel:${event.contactPhone}`}
										className="text-blue-600 dark:text-blue-400 hover:underline"
									>
										{event.contactPhone}
									</a>
								</p>
							)}
						</div>
					</div>
				)}

				{(event.flyerUrl || event.websiteUrl) && (
					<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
						<h3 className="font-semibold text-gray-900 dark:text-white mb-3">Links</h3>
						<div className="flex flex-wrap gap-3">
							{event.flyerUrl && (
								<a
									href={event.flyerUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
								>
									View Flyer
								</a>
							)}
							{event.websiteUrl && (
								<a
									href={event.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
								>
									Visit Website
								</a>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
