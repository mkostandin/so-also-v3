import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api-client';
import SessionCard from '@/components/SessionCard';
import ProgramAgenda from '@/components/ProgramAgenda';
import NotificationsToggles from '@/components/NotificationsToggles';
import FlagButton from '@/components/FlagButton';
import type { Conference, ConferenceSession } from '@/lib/api-client';

export default function ConferenceDetail() {
	const { id = '' } = useParams();
	const [conf, setConf] = useState<Conference | null>(null);
	const [sessions, setSessions] = useState<ConferenceSession[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [view, setView] = useState<'sessions' | 'agenda'>('sessions');
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setLoading(true);
				setError(null);
				const [c, s] = await Promise.all([api.conference(id), api.sessions(id)]);
				if (mounted) {
					setConf(c);
					setSessions(s);
				}
			} catch (err) {
				if (mounted) {
					setError(err instanceof Error ? err.message : 'Failed to load conference');
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		})();
		return () => { mounted = false; };
	}, [id]);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="rounded-lg border bg-white dark:bg-gray-900 p-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
					</div>
				</div>
				<div className="rounded-lg border bg-white dark:bg-gray-900 p-6">
					<div className="animate-pulse">
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
						<div className="space-y-3">
							<div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
							<div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
							<div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-6">
				<h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Error Loading Conference</h2>
				<p className="text-red-700 dark:text-red-200">{error}</p>
			</div>
		);
	}

	if (!conf) {
		return (
			<div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800 p-6">
				<h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Conference Not Found</h2>
				<p className="text-yellow-700 dark:text-yellow-200">The conference you're looking for doesn't exist or has been removed.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Conference Header */}
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-bold">{conf.name}</h1>
					{conf.city && <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">📍 {conf.city}</div>}
					{(conf.startsAtUtc || conf.endsAtUtc) && (
						<div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
							🗓️ {conf.startsAtUtc && new Date(conf.startsAtUtc).toLocaleDateString()}
							{conf.endsAtUtc && ` - ${new Date(conf.endsAtUtc).toLocaleDateString()}`}
						</div>
					)}
				</div>
				<div className="flex items-center gap-3">
					{conf.websiteUrl && (
						<a
							href={conf.websiteUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-2 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
						>
							🌐 Website
						</a>
					)}
					<FlagButton targetType="conference" targetId={conf.id} />
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="border-b border-gray-200 dark:border-gray-700">
				<nav className="flex space-x-8">
					<button
						onClick={() => setView('sessions')}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							view === 'sessions'
								? 'border-blue-500 text-blue-600 dark:text-blue-400'
								: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
						}`}
					>
						Sessions ({sessions.length})
					</button>
					<button
						onClick={() => setView('agenda')}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							view === 'agenda'
								? 'border-blue-500 text-blue-600 dark:text-blue-400'
								: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
						}`}
					>
						Program Agenda
					</button>
				</nav>
			</div>

			{/* Notifications Section */}
			<div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
				<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
					🔔 Conference Notifications
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Conference Updates</h4>
						<NotificationsToggles
							conferenceId={id}
							showConferenceTopics={true}
						/>
					</div>
					<div>
						<h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Session Types</h4>
						<NotificationsToggles
							conferenceId={id}
							showSessionTopics={true}
						/>
					</div>
				</div>
			</div>

			{/* Content */}
			{view === 'sessions' ? (
				<div className="space-y-4">
					{sessions.length === 0 ? (
						<div className="text-center py-8 text-gray-500 dark:text-gray-400">
							No sessions scheduled yet.
						</div>
					) : (
						<div className="grid gap-4">
							{sessions.map((s) => <SessionCard key={s.id} session={s} />)}
						</div>
					)}
				</div>
			) : (
				<ProgramAgenda
					sessions={sessions}
					conferenceStart={conf.startsAtUtc}
					conferenceEnd={conf.endsAtUtc}
				/>
			)}
		</div>
	);
}
