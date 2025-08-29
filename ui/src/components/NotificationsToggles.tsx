import { useEffect, useState, useMemo } from 'react';

interface NotificationsTogglesProps {
	topics?: string[];
	conferenceId?: string;
	showConferenceTopics?: boolean;
	showSessionTopics?: boolean;
}

const CONFERENCE_TOPICS = [
	'conference_announcements',
	'conference_updates',
	'new_sessions',
	'registration_deadlines',
	'hotel_booking'
];

const SESSION_TOPICS = [
	'panels',
	'workshops',
	'dances',
	'main_sessions',
	'marathon_sessions',
	'events',
	'main_meetings',
	'keynote_speakers'
];

export default function NotificationsToggles({
	topics = [],
	conferenceId,
	showConferenceTopics = false,
	showSessionTopics = false
}: NotificationsTogglesProps) {
	const storageKey = conferenceId
		? `soalso:notify:conference:${conferenceId}`
		: 'soalso:notify:topics';

	// Determine which topics to display
	const displayTopics = useMemo(() => {
		if (showConferenceTopics) return CONFERENCE_TOPICS;
		if (showSessionTopics) return SESSION_TOPICS;
		return topics;
	}, [topics, showConferenceTopics, showSessionTopics]);

	const [enabled, setEnabled] = useState<Record<string, boolean>>({});
	useEffect(() => {
		try {
			const raw = localStorage.getItem(storageKey);
			if (raw) setEnabled(JSON.parse(raw));
		} catch (error) {
			// Silently handle localStorage errors (e.g., private browsing mode)
			console.warn('Failed to load notification preferences from localStorage:', error);
		}
	}, [storageKey]);
	useEffect(() => {
		try {
			localStorage.setItem(storageKey, JSON.stringify(enabled));
		} catch (error) {
			// Silently handle localStorage errors (e.g., private browsing mode)
			console.warn('Failed to save notification preferences to localStorage:', error);
		}
	}, [enabled, storageKey]);

	const formatTopicLabel = (topic: string) => {
		return topic.split('_').map(word =>
			word.charAt(0).toUpperCase() + word.slice(1)
		).join(' ');
	};

	return (
		<div className="space-y-2" role="group" aria-label="Notification preferences">
			{displayTopics.map((t) => (
				<label
					key={t}
					className="flex items-center justify-between rounded border p-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
					htmlFor={`notification-${t}`}
				>
					<span className="text-gray-900 dark:text-gray-100">{formatTopicLabel(t)}</span>
					<input
						id={`notification-${t}`}
						type="checkbox"
						checked={!!enabled[t]}
						onChange={(e) => setEnabled({ ...enabled, [t]: e.target.checked })}
						className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2"
						aria-describedby={`notification-${t}-description`}
					/>
				</label>
			))}
		</div>
	);
}
