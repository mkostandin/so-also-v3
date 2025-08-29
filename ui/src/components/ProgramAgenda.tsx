import { useState, useMemo } from 'react';
import SessionCard from './SessionCard';
import { getSessionTypeConfigAlt, formatTime, formatDate, getUniqueValues } from '@/lib/session-utils';
import type { ConferenceSession } from '@/lib/api-client';



interface ProgramAgendaProps {
	sessions: ConferenceSession[];
	conferenceStart?: string;
	conferenceEnd?: string;
}



export default function ProgramAgenda({ sessions }: ProgramAgendaProps) {
	const [selectedDate, setSelectedDate] = useState<string>('');
	const [selectedType, setSelectedType] = useState<string>('');
	const [selectedRoom, setSelectedRoom] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState<string>('');

	// Get unique dates, types, and rooms from sessions
	const availableDates = useMemo(() => {
		const dates = sessions
			.filter(session => session.startsAtUtc)
			.map(session => new Date(session.startsAtUtc!).toDateString())
			.filter((date, index, array) => array.indexOf(date) === index)
			.sort();
		return dates;
	}, [sessions]);

	const availableTypes = useMemo(() => {
		return getUniqueValues(sessions, 'type').sort() as string[];
	}, [sessions]);

	const availableRooms = useMemo(() => {
		return getUniqueValues(sessions.filter(s => s.room), 'room').sort() as string[];
	}, [sessions]);

	// Filter sessions based on selections
	const filteredSessions = useMemo(() => {
		return sessions.filter(session => {
			if (selectedDate && session.startsAtUtc && new Date(session.startsAtUtc).toDateString() !== selectedDate) {
				return false;
			}
			if (selectedType && session.type !== selectedType) {
				return false;
			}
			if (selectedRoom && session.room !== selectedRoom) {
				return false;
			}
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const matchesTitle = session.title?.toLowerCase().includes(query);
				const matchesDesc = session.desc?.toLowerCase().includes(query);
				const matchesSpeaker = session.speaker?.toLowerCase().includes(query);
				const matchesRoom = session.room?.toLowerCase().includes(query);
				if (!matchesTitle && !matchesDesc && !matchesSpeaker && !matchesRoom) {
					return false;
				}
			}
			return true;
		}).sort((a, b) => {
			if (!a.startsAtUtc || !b.startsAtUtc) return 0;
			return new Date(a.startsAtUtc).getTime() - new Date(b.startsAtUtc).getTime();
		});
	}, [sessions, selectedDate, selectedType, selectedRoom, searchQuery]);

	// Group sessions by time slots
	const timeSlots = useMemo(() => {
		const slots: { [key: string]: Session[] } = {};
		filteredSessions.forEach(session => {
			if (!session.startsAtUtc) return;
			const timeKey = formatTime(session.startsAtUtc);
			if (!slots[timeKey]) {
				slots[timeKey] = [];
			}
			slots[timeKey].push(session);
		});
		return slots;
	}, [filteredSessions]);

	return (
		<div className="space-y-6">
			{/* Filters */}
			<div className="bg-white dark:bg-gray-900 rounded-lg border p-4" role="region" aria-labelledby="filter-heading">
				<h3 id="filter-heading" className="font-semibold text-lg mb-4">Filter Sessions</h3>

				{/* Search */}
				<div className="mb-4">
					<label htmlFor="session-search" className="sr-only">Search sessions</label>
					<input
						id="session-search"
						type="text"
						placeholder="Search sessions, speakers, rooms..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						aria-describedby="search-help"
					/>
					<div id="search-help" className="sr-only">Search through session titles, speakers, descriptions, and room names</div>
				</div>

				{/* Filter Controls */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Date Filter */}
					<div>
						<label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Date
						</label>
						<select
							id="date-filter"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							aria-describedby="date-filter-help"
						>
							<option value="">All Dates</option>
							{availableDates.map(date => (
								<option key={date} value={date}>{formatDate(date)}</option>
							))}
						</select>
						<div id="date-filter-help" className="sr-only">Filter sessions by date</div>
					</div>

					{/* Type Filter */}
					<div>
						<label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Session Type
						</label>
						<select
							id="type-filter"
							value={selectedType}
							onChange={(e) => setSelectedType(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							aria-describedby="type-filter-help"
						>
							<option value="">All Types</option>
							{availableTypes.map(type => (
								<option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
							))}
						</select>
						<div id="type-filter-help" className="sr-only">Filter sessions by type (workshop, panel, etc.)</div>
					</div>

					{/* Room Filter */}
					<div>
						<label htmlFor="room-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Room
						</label>
						<select
							id="room-filter"
							value={selectedRoom}
							onChange={(e) => setSelectedRoom(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							aria-describedby="room-filter-help"
						>
							<option value="">All Rooms</option>
							{availableRooms.map(room => (
								<option key={room} value={room}>{room}</option>
							))}
						</select>
						<div id="room-filter-help" className="sr-only">Filter sessions by room location</div>
					</div>
				</div>

				{/* Clear Filters */}
				<div className="mt-4 flex justify-between items-center">
					<span className="text-sm text-gray-600 dark:text-gray-400">
						{filteredSessions.length} of {sessions.length} sessions
					</span>
					<button
						onClick={() => {
							setSelectedDate('');
							setSelectedType('');
							setSelectedRoom('');
							setSearchQuery('');
						}}
						className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
						aria-label="Clear all filters and search terms"
					>
						Clear Filters
					</button>
				</div>
			</div>

			{/* Agenda */}
			<div className="space-y-4">
				{Object.keys(timeSlots).length === 0 ? (
					<div className="text-center py-8 text-gray-500 dark:text-gray-400">
						No sessions match your current filters.
					</div>
				) : (
					Object.entries(timeSlots).map(([time, sessionsAtTime]) => (
						<div key={time} className="space-y-3">
							{/* Time Header */}
							<div className="flex items-center gap-3">
								<div className="text-lg font-semibold text-gray-900 dark:text-white">
									{time}
								</div>
								<div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
								<div className="text-sm text-gray-500 dark:text-gray-400">
									{sessionsAtTime.length} session{sessionsAtTime.length !== 1 ? 's' : ''}
								</div>
							</div>

							{/* Sessions at this time */}
							<div className="grid gap-3">
								{sessionsAtTime.map(session => (
									<div key={session.id} className={`rounded-lg border-2 p-4 ${getSessionTypeConfigAlt(session.type).color}`}>
										<SessionCard session={session} />
									</div>
								))}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
