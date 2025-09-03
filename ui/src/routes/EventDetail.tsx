import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, EventItem } from '@/lib/api-client';
import FlagButton from '@/components/FlagButton';
import ImageGallery from '@/components/ImageGallery';
import CommitteeNotificationsToggle from '@/components/CommitteeNotificationsToggle';
import { metersToMiles } from '@/lib/location-utils';
import { formatDate } from '@/lib/session-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function EventDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [event, setEvent] = useState<EventItem | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isTouchDevice, setIsTouchDevice] = useState(false);
	const [showNoEmailDialog, setShowNoEmailDialog] = useState(false);

	const closeMenu = useCallback(() => {
		setIsMenuOpen(false);
	}, []);

	const handleContactCommittee = useCallback(() => {
		if (event?.contactEmail) {
			window.location.href = `mailto:${event.contactEmail}`;
		} else {
			setShowNoEmailDialog(true);
		}
	}, [event?.contactEmail]);

	// Detect touch device on mount
	useEffect(() => {
		setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
	}, []);

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

		// Mobile-specific: close menu on scroll or outside tap
		if (isTouchDevice) {
			const handleScroll = () => closeMenu();
			const handleClickOutside = (e: MouseEvent | TouchEvent) => {
				const target = e.target as Element;
				// Close if clicked outside the menu area
				if (!target.closest('.menu-container') && !target.closest('button[aria-label="More options"]')) {
					closeMenu();
				}
			};

			window.addEventListener('scroll', handleScroll, { passive: true });
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('touchstart', handleClickOutside);

			return () => {
				window.removeEventListener('scroll', handleScroll);
				document.removeEventListener('click', handleClickOutside);
				document.removeEventListener('touchstart', handleClickOutside);
			};
		}
	}, [id, closeMenu, isTouchDevice]);

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

			<div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-6 relative">
				{/* 3-dot menu button */}
				<div className="absolute top-4 right-4 menu-container">
					<button
						className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						aria-label="More options"
						onClick={(e) => {
							e.stopPropagation();
							setIsMenuOpen(!isMenuOpen);
						}}
					>
						<svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
							<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
						</svg>
					</button>
					{/* Desktop hover menu */}
					{!isTouchDevice && (
						<div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 opacity-0 invisible hover:opacity-100 hover:visible transition-all duration-200">
							<div className="py-2">
								<div className="px-3">
									<FlagButton
										targetType="event"
										targetId={event.id}
										committeeSlug={event.committee || undefined}
										className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium cursor-pointer"
									/>
								</div>
							</div>
						</div>
					)}
					{/* Mobile click menu */}
					{isTouchDevice && isMenuOpen && (
						<div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
							<div className="py-2">
								<div className="px-3">
									<FlagButton
										targetType="event"
										targetId={event.id}
										committeeSlug={event.committee || undefined}
										className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium cursor-pointer"
									/>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Event Title */}
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{event.name}</h1>
				</div>

				{/* Event Tags */}
				<div className="flex justify-center gap-3">
					{event.eventType && (
						<span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-4 py-2 rounded-full font-medium">
							{event.eventType}
						</span>
					)}
					{event.committee && (
						<span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm px-4 py-2 rounded-full font-medium">
							{event.committee}
						</span>
					)}
				</div>

				{/* Image Gallery */}
				{event.imageUrls && event.imageUrls.length > 0 && (
					<div className="w-full">
						<ImageGallery images={event.imageUrls} />
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex justify-center gap-4">
					<button onClick={handleShare} className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
						Share
					</button>
					<button onClick={handleDirections} className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-black/80 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
						Get Directions
					</button>
				</div>

				{/* Share success message */}
				{copied && (
					<div className="text-center text-sm text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-300 px-4 py-2 rounded-lg">
						Link copied to clipboard
					</div>
				)}

				{/* Committee Notifications Toggle */}
				{event.committee && event.committeeSlug && (
					<CommitteeNotificationsToggle
						committeeSlug={event.committeeSlug}
						committeeName={event.committee}
					/>
				)}

				{/* Description */}
				{event.description && (
					<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
						<p className="text-gray-700 dark:text-gray-300 leading-relaxed text-left">{event.description}</p>
					</div>
				)}

				{/* Date */}
				{event.startsAtUtc && (
					<div className="text-left">
						<p className="text-xl font-semibold text-gray-900 dark:text-white">
							{formatDate(event.startsAtUtc)}
						</p>
					</div>
				)}

				{/* Location */}
				{(event.address || event.city || event.stateProv) && (
					<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
						<h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-left">Location</h3>
						<div className="text-left space-y-1">
							{event.address && (
								<p className="text-gray-700 dark:text-gray-300">{event.address}</p>
							)}
							{(event.city || event.stateProv) && (
								<p className="text-gray-700 dark:text-gray-300">
									{[event.city, event.stateProv].filter(Boolean).join(', ')}
								</p>
							)}
							{event.distanceMeters !== undefined && isFinite(event.distanceMeters) && (
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
									{metersToMiles(event.distanceMeters).toFixed(1)} miles away
								</p>
							)}
						</div>
					</div>
				)}

				{/* Committee Website and Email */}
				{(event.websiteUrl || event.contactEmail) && (
					<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
						<h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-center">Contact Information</h3>
						<div className="flex flex-col items-center gap-3">
							{event.websiteUrl && (
								<a
									href={event.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
								>
									Visit Committee Website
								</a>
							)}
							{event.contactEmail && (
								<button
									onClick={handleContactCommittee}
									className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
								>
									Contact Committee
								</button>
							)}
						</div>
					</div>
				)}


			</div>

			{/* No Email Dialog */}
			<Dialog open={showNoEmailDialog} onOpenChange={setShowNoEmailDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>No Email Available</DialogTitle>
						<DialogDescription>
							No email was submitted with this event.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end">
						<Button onClick={() => setShowNoEmailDialog(false)}>
							OK
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
