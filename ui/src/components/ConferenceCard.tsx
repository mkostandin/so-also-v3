import { Link } from 'react-router-dom';

export default function ConferenceCard({ conf }: { conf: any }) {
	return (
		<Link to={`/app/conferences/${conf.id}`} className="block rounded border p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
			<div className="font-semibold">{conf.name}</div>
			{conf.city && <div className="text-sm text-gray-600">{conf.city}</div>}
			{conf.startsAtUtc && <div className="text-xs text-gray-500">{new Date(conf.startsAtUtc).toLocaleDateString()} - {conf.endsAtUtc && new Date(conf.endsAtUtc).toLocaleDateString()}</div>}
		</Link>
	);
}
