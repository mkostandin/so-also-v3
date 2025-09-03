import { useEffect, useState, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { isPWAInstalled, installPWA } from '@/lib/session-utils';

interface CommitteeNotificationsToggleProps {
	committeeSlug: string;
	committeeName: string;
}

export default function CommitteeNotificationsToggle({
	committeeSlug,
	committeeName
}: CommitteeNotificationsToggleProps) {
	const [isEnabled, setIsEnabled] = useState(false);
	const [isAppInstalled, setIsAppInstalled] = useState(false);
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);

	const storageKey = `soalso:notify:committee:${committeeSlug}`;

	// Detect if device is touch-enabled (mobile)
	const isTouchDevice = () => {
		return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	};

	const closeTooltip = useCallback(() => {
		setIsTooltipOpen(false);
	}, []);

	useEffect(() => {
		// Load notification preference from localStorage
		try {
			const saved = localStorage.getItem(storageKey);
			if (saved) {
				setIsEnabled(JSON.parse(saved));
			}
		} catch (error) {
			console.warn('Failed to load notification preferences:', error);
		}

		// Check if app is already installed
		setIsAppInstalled(isPWAInstalled());

		// Listen for PWA installation prompt
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e);
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

		// Mobile-specific: close tooltip on scroll or outside tap
		if (isTouchDevice()) {
			const handleScroll = () => closeTooltip();
			const handleClickOutside = (e: MouseEvent | TouchEvent) => {
				const target = e.target as Element;
				// Close if clicked outside the tooltip area (look for our custom tooltip elements)
				if (!target.closest('.relative') || (!target.closest('button[aria-label="Notification settings information"]') && !target.closest('.bg-gray-900'))) {
					closeTooltip();
				}
			};

			window.addEventListener('scroll', handleScroll, { passive: true });
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('touchstart', handleClickOutside);

			return () => {
				window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
				window.removeEventListener('scroll', handleScroll);
				document.removeEventListener('click', handleClickOutside);
				document.removeEventListener('touchstart', handleClickOutside);
			};
		}

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		};
	}, [committeeSlug, storageKey, closeTooltip]);

	const handleToggle = (enabled: boolean) => {
		setIsEnabled(enabled);
		try {
			localStorage.setItem(storageKey, JSON.stringify(enabled));
		} catch (error) {
			console.warn('Failed to save notification preferences:', error);
		}
	};

	const handleInstallApp = async () => {
		if (isAppInstalled) {
			alert('App is already installed!');
			return;
		}

		const success = await installPWA(deferredPrompt);
		if (success) {
			setDeferredPrompt(null);
		}
	};

	return (
		<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<h3 className="font-medium text-gray-900 dark:text-white">
						Get {committeeName} Notifications
					</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Receive notifications for {committeeName} events and updates
					</p>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<TooltipProvider delayDuration={isTouchDevice() ? 0 : 700}>
					{isTouchDevice() ? (
						// Mobile: Custom tooltip behavior
						<div className="relative">
							<button
								className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
								aria-label="Notification settings information"
								onClick={(e) => {
									e.stopPropagation();
									setIsTooltipOpen(!isTooltipOpen);
								}}
							>
								<Info className="w-4 h-4" />
							</button>
							{isTooltipOpen && (
								<div className="absolute bottom-full right-0 mb-2 z-50">
									<div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg min-w-64 max-w-[min(24rem,calc(100vw-3rem))] text-sm leading-relaxed">
										<div className="space-y-2">
											<p>On the day of the event you will get notification of the event and conference.</p>
											<p>
												Must install app -{' '}
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleInstallApp();
													}}
													className="text-blue-300 hover:text-blue-100 underline whitespace-nowrap"
												>
													{isAppInstalled ? 'App already installed' : 'Install app'}
												</button>
											</p>
										</div>
										<div className="absolute top-full right-4 transform -mt-1">
											<div className="w-2 h-2 bg-gray-900 rotate-45"></div>
										</div>
									</div>
								</div>
							)}
						</div>
					) : (
						// Desktop: Standard Radix tooltip
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
									aria-label="Notification settings information"
								>
									<Info className="w-4 h-4" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top" className="max-w-xs">
								<div className="space-y-2">
									<p>On the day of the event you will get notification of the event and conference.</p>
									<p>
										Must install app -{' '}
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleInstallApp();
											}}
											className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
										>
											{isAppInstalled ? 'App already installed' : 'Install app'}
										</button>
									</p>
								</div>
							</TooltipContent>
						</Tooltip>
					)}
				</TooltipProvider>

				<Switch
					checked={isEnabled}
					onCheckedChange={handleToggle}
					aria-label={`Toggle notifications for ${committeeName}`}
				/>
			</div>
		</div>
	);
}
