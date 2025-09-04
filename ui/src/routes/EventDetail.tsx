/**
 * EventDetail Page Component
 *
 * Displays comprehensive event information with integrated card layout design.
 * Features mobile-optimized touch interactions and responsive design.
 *
 * Layout Structure:
 * - Integrated card design (back button + title inside main card)
 * - Mobile-first responsive padding (px-4 on mobile, px-0 on desktop)
 * - Consistent spacing with proper visual hierarchy
 * - Touch-optimized interactions with instant response
 *
 * Key Features:
 * - Real-time navigation with React Router
 * - Optimized API calls (14-day range, 96% data reduction)
 * - Progressive loading states (loading, error, content)
 * - Mobile touch optimizations with hardware acceleration
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, EventItem } from '@/lib/api-client';
import FlagButton from '@/components/FlagButton';
import ImageGallery from '@/components/ImageGallery';
import CommitteeNotificationsToggle from '@/components/CommitteeNotificationsToggle';
import EventTags from '@/components/EventTags';
import EventActions from '@/components/EventActions';
import EventContent from '@/components/EventContent';
import EventContact from '@/components/EventContact';
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
	const [showNoEmailDialog, setShowNoEmailDialog] = useState(false);

	// Detect touch device synchronously to avoid timing issues
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

	// Callback to close the 3-dot menu, memoized to prevent unnecessary re-renders
	const closeMenu = useCallback(() => {
		setIsMenuOpen(false);
	}, []);

	// Memoize the back button handler to prevent unnecessary re-renders
	const handleBack = useCallback(() => {
		// For shared links and better UX, always go to the main list view
		// This provides a consistent experience regardless of how users arrived at the event
		navigate('/app/map/list');
	}, [navigate]);

	const handleContactCommittee = useCallback(() => {
		if (event?.contactEmail) {
			window.location.href = `mailto:${event.contactEmail}`;
		} else {
			setShowNoEmailDialog(true);
		}
	}, [event?.contactEmail]);

	useEffect(() => {
		if (!id) return;

		const fetchEvent = async () => {
			try {
				setLoading(true);
				// Optimize API call by using minimal time range (14 days instead of 365)
				// This reduces data transfer by 96% while maintaining functionality
				// Combined with shared API calls across views for instant switching
				const events = await api.browse({ range: 14 });
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

		// Optimized mobile event listeners - only add when menu is actually open
		// This prevents unnecessary event listeners when menu is closed for better performance
		if (isTouchDevice && isMenuOpen) {
			let lastTouchTime = 0;
			const TOUCH_DEBOUNCE = 200; // Prevent rapid successive touches

			const handleScroll = () => closeMenu();
			const handleClickOutside = (e: MouseEvent | TouchEvent) => {
				const now = Date.now();
				if (now - lastTouchTime < TOUCH_DEBOUNCE) return;
				lastTouchTime = now;

				const target = e.target as Element;
				// Close menu if click is outside both the menu container and the menu button
				if (!target.closest('.menu-container') && !target.closest('button[aria-label="More options"]')) {
					closeMenu();
				}
			};

			// Use passive listeners for better performance and bubbling phase to avoid conflicts
			window.addEventListener('scroll', handleScroll, { passive: true });
			document.addEventListener('click', handleClickOutside, false);
			document.addEventListener('touchend', handleClickOutside, { passive: true });

			return () => {
				window.removeEventListener('scroll', handleScroll);
				document.removeEventListener('click', handleClickOutside, false);
				document.removeEventListener('touchend', handleClickOutside, false);
			};
		}
	}, [id, closeMenu, isTouchDevice, isMenuOpen]);



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
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
				<div className="max-w-2xl mx-auto px-4 sm:px-0">
					<div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-6 relative">
						{/* Back button and title at the top of the card */}
						<div className="space-y-4 pb-6 border-b border-gray-100 dark:border-gray-700">
							<div className="flex justify-start">
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										handleBack();
									}}
									className="mobile-touch-button event-header-back-btn bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 active:bg-gray-800 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-800 touch-manipulation select-none min-h-[44px] flex items-center justify-center relative z-[60]"
									title="Go back to So Also main list"
									aria-label="Go back to So Also main list"
									style={{
										WebkitTouchCallout: 'none',
										WebkitUserSelect: 'none',
										WebkitTapHighlightColor: 'transparent'
									}}
								>
									← Back to So Also
								</button>
							</div>

							<div className="text-center">
								<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</h1>
							</div>
						</div>

						<div className="flex items-center justify-center p-8">
							<div className="text-center">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
								<p className="text-sm text-gray-600 dark:text-gray-400">Loading event details...</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !event) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
				<div className="max-w-2xl mx-auto px-4 sm:px-0">
					<div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-6 relative">
						{/* Back button and title at the top of the card */}
						<div className="space-y-4 pb-6 border-b border-gray-100 dark:border-gray-700">
							<div className="flex justify-start">
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										handleBack();
									}}
									className="mobile-touch-button event-header-back-btn bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 active:bg-gray-800 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-800 touch-manipulation select-none min-h-[44px] flex items-center justify-center relative z-[60]"
									title="Go back to So Also main list"
									aria-label="Go back to So Also main list"
									style={{
										WebkitTouchCallout: 'none',
										WebkitUserSelect: 'none',
										WebkitTapHighlightColor: 'transparent'
									}}
								>
									← Back to So Also
								</button>
							</div>

							<div className="text-center">
								<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Error</h1>
							</div>
						</div>

						<div className="text-center p-8">
							<p className="text-red-600 dark:text-red-400">{error || 'Event not found'}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
			<div className="max-w-2xl mx-auto px-4 sm:px-0">
				<div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-6 relative">
					{/* Header section: Back button, title, and event tags above separator for improved visual hierarchy */}
					<div className="space-y-4 pb-6 border-b border-gray-100 dark:border-gray-700">
						{/* Back navigation button */}
						<div className="flex justify-start">
							<button
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									handleBack();
								}}
								className="mobile-touch-button event-header-back-btn bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 active:bg-gray-800 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-800 touch-manipulation select-none min-h-[44px] flex items-center justify-center relative z-[60]"
								title="Go back to So Also main list"
								aria-label="Go back to So Also main list"
								style={{
									WebkitTouchCallout: 'none',
									WebkitUserSelect: 'none',
									WebkitTapHighlightColor: 'transparent'
								}}
							>
								← Back to So Also
							</button>
						</div>

						{/* Event title */}
						<div className="text-center">
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{event.name}</h1>
						</div>

						{/* Event Tags - positioned above separator for better visual hierarchy */}
						<EventTags eventType={event.eventType} committee={event.committee} />
					</div>

					{/* 3-dot menu button - positioned absolutely in top-right corner */}
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
					{/* Desktop hover menu - shows on hover, no state management needed */}
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
					{/* Mobile click menu - shows when isMenuOpen state is true */}
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


				{/* Image Gallery */}
				{event.imageUrls && event.imageUrls.length > 0 && (
					<div className="w-full">
						<ImageGallery images={event.imageUrls} />
					</div>
				)}

				{/* Action Buttons */}
				<EventActions onShare={handleShare} onDirections={handleDirections} copied={copied} />

				{/* Committee Notifications Toggle */}
				{event.committee && event.committeeSlug && (
					<CommitteeNotificationsToggle
						committeeSlug={event.committeeSlug}
						committeeName={event.committee}
					/>
				)}

				{/* Event Content - unified component with enhanced date/time formatting and smart address parsing */}
				<EventContent
					description={event.description}
					startsAtUtc={event.startsAtUtc}
					endsAtUtc={event.endsAtUtc} // Added for comprehensive time range display
					address={event.address}
					city={event.city}
					stateProv={event.stateProv}
					distanceMeters={event.distanceMeters}
				/>

				{/* Contact Information */}
				<EventContact
					websiteUrl={event.websiteUrl}
					contactEmail={event.contactEmail}
					onContactCommittee={handleContactCommittee}
				/>


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
		</div>
	);
}
