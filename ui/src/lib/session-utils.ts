export type SessionType = 'workshop' | 'panel' | 'main' | 'marathon' | 'dance' | 'event' | 'main_meeting';

export interface SessionTypeConfig {
	label: string;
	color: string;
	emoji: string;
}

export const getSessionTypeConfig = (type: SessionType): SessionTypeConfig => {
	const configs: Record<SessionType, SessionTypeConfig> = {
		workshop: { label: 'Workshop', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', emoji: '🔧' },
		panel: { label: 'Panel', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', emoji: '🎤' },
		main: { label: 'Main Session', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', emoji: '⭐' },
		marathon: { label: 'Marathon', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', emoji: '🏃' },
		dance: { label: 'Dance', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200', emoji: '💃' },
		event: { label: 'Event', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', emoji: '🎉' },
		main_meeting: { label: 'Main Meeting', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', emoji: '🏛️' }
	};

	return configs[type] || { label: type, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', emoji: '📅' };
};

export const getSessionTypeConfigAlt = (type: SessionType): SessionTypeConfig => {
	const configs: Record<SessionType, SessionTypeConfig> = {
		workshop: { label: 'Workshop', color: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950', emoji: '🔧' },
		panel: { label: 'Panel', color: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950', emoji: '🎤' },
		main: { label: 'Main Session', color: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950', emoji: '⭐' },
		marathon: { label: 'Marathon', color: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950', emoji: '🏃' },
		dance: { label: 'Dance', color: 'border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950', emoji: '💃' },
		event: { label: 'Event', color: 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950', emoji: '🎉' },
		main_meeting: { label: 'Main Meeting', color: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950', emoji: '🏛️' }
	};

	return configs[type] || { label: type, color: 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950', emoji: '📅' };
};

export const formatTime = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
};

export const calculateDuration = (start: string, end?: string): number | null => {
	if (!end) return null;
	const startTime = new Date(start).getTime();
	const endTime = new Date(end).getTime();
	const durationMs = endTime - startTime;
	const durationMinutes = Math.round(durationMs / (1000 * 60));
	return durationMinutes;
};

export const getUniqueValues = <T,>(array: T[], key: keyof T): T[keyof T][] => {
	return [...new Set(array.map(item => item[key]))];
};
