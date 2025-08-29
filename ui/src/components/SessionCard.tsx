export default function SessionCard({ session }: { session: any }) {
	return (
		<div className="rounded border p-3">
			<div className="font-medium">{session.title}</div>
			{session.startsAtUtc && <div className="text-xs text-gray-500">{new Date(session.startsAtUtc).toLocaleString()}</div>}
			{session.room && <div className="text-xs text-gray-600">Room: {session.room}</div>}
		</div>
	);
}
