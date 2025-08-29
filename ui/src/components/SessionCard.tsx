import { getSessionTypeConfig, formatTime, calculateDuration } from '@/lib/session-utils';
import type { ConferenceSession } from '@/lib/api-client';

export default function SessionCard({ session }: { session: ConferenceSession }) {
	const typeConfig = getSessionTypeConfig(session.type);
	const duration = session.startsAtUtc && session.endsAtUtc ? calculateDuration(session.startsAtUtc, session.endsAtUtc) : null;

	return (
		<div className="rounded-lg border bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between mb-2">
				<h4 className="font-semibold text-gray-900 dark:text-white flex-1">{session.title}</h4>
				<span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${typeConfig.color} ml-2 flex-shrink-0`}>
					{typeConfig.emoji} {typeConfig.label}
				</span>
			</div>

			{/* Time and Room */}
			<div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
				{session.startsAtUtc && (
					<div className="flex items-center gap-1">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>{formatTime(session.startsAtUtc)}</span>
						{duration && (
							<span className="text-xs text-gray-500">({duration}min)</span>
						)}
					</div>
				)}

				{session.room && (
					<div className="flex items-center gap-1">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
						</svg>
						<span>{session.room}</span>
					</div>
				)}
			</div>

			{/* Description */}
			{session.desc && (
				<div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
					<p className="line-clamp-2">{session.desc}</p>
				</div>
			)}

			{/* Additional Info */}
			{session.speaker && (
				<div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
					👤 Speaker: {session.speaker}
				</div>
			)}
		</div>
	);
}
