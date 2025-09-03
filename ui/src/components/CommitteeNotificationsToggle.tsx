import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import PWAInstallButton from '@/components/PWAInstallButton';
import MobileTooltip from '@/components/MobileTooltip';

/**
 * Props for the CommitteeNotificationsToggle component
 * @interface CommitteeNotificationsToggleProps
 */
interface CommitteeNotificationsToggleProps {
	/** The unique slug identifier for the committee */
	committeeSlug: string;
	/** The display name of the committee */
	committeeName: string;
}

/**
 * Toggle component for enabling/disabling notifications for a specific committee.
 * Handles both desktop and mobile tooltip implementations with PWA installation prompts.
 *
 * Features:
 * - localStorage persistence for notification preferences
 * - Device-specific tooltip implementations (desktop vs mobile)
 * - Integrated PWA installation prompts
 * - Graceful fallback for unsupported browsers
 *
 * @param props Component props
 * @returns React component
 */
export default function CommitteeNotificationsToggle({
	committeeSlug,
	committeeName
}: CommitteeNotificationsToggleProps) {
	const [isEnabled, setIsEnabled] = useState(false);
	const [isTouchDevice, setIsTouchDevice] = useState(false);
	const storageKey = `soalso:notify:committee:${committeeSlug}`;

	// Detect touch device on mount
	useEffect(() => {
		setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
	}, []);

	// Load notification preference from localStorage on mount
	useEffect(() => {
		try {
			const saved = localStorage.getItem(storageKey);
			if (saved) {
				setIsEnabled(JSON.parse(saved));
			}
		} catch (error) {
			console.warn('Failed to load notification preferences:', error);
		}
	}, [storageKey]);

	const handleToggle = (enabled: boolean) => {
		setIsEnabled(enabled);
		try {
			localStorage.setItem(storageKey, JSON.stringify(enabled));
		} catch (error) {
			console.warn('Failed to save notification preferences:', error);
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
				<TooltipProvider delayDuration={isTouchDevice ? 0 : 700}>
					<PWAInstallButton>
						{({ isAppInstalled, handleInstall }) => (
							isTouchDevice ? (
								/* Mobile Tooltip */
								<MobileTooltip
									content={
										<div className="space-y-2">
											<p>On the day of the event you will get notification of the event and conference.</p>
											<p>
												Must install app -{' '}
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleInstall();
													}}
													className="text-blue-300 hover:text-blue-100 underline whitespace-nowrap"
												>
													{isAppInstalled ? 'App already installed' : 'Install app'}
												</button>
											</p>
										</div>
									}
									ariaLabel="Notification settings information"
								>
									<div className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
										<Info className="w-4 h-4" />
									</div>
								</MobileTooltip>
							) : (
								/* Desktop Tooltip */
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
														handleInstall();
													}}
													className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
												>
													{isAppInstalled ? 'App already installed' : 'Install app'}
												</button>
											</p>
										</div>
									</TooltipContent>
								</Tooltip>
							)
						)}
					</PWAInstallButton>
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
