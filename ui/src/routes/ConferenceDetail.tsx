import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api-client';
import SessionCard from '@/components/SessionCard';
import FlagButton from '@/components/FlagButton';

export default function ConferenceDetail() {
	const { id = '' } = useParams();
	const [conf, setConf] = useState<any | null>(null);
	const [sessions, setSessions] = useState<any[]>([]);
	useEffect(() => {
		let mounted = true;
		(async () => {
			const [c, s] = await Promise.all([api.conference(id), api.sessions(id)]);
			if (mounted) { setConf(c); setSessions(s); }
		})();
		return () => { mounted = false; };
	}, [id]);
	if (!conf) return <div className="rounded border p-3 text-sm">Loading…</div>;
	return (
		<div className="space-y-4">
			<div className="flex items-start justify-between">
				<div>
					<h2 className="text-xl font-semibold">{conf.name}</h2>
					{conf.city && <div className="text-sm text-gray-600">{conf.city}</div>}
				</div>
				<FlagButton targetType="conference" targetId={conf.id} />
			</div>
			<div className="space-y-2">
				<h3 className="font-semibold">Sessions</h3>
				<div className="grid gap-2">
					{sessions.map((s) => <SessionCard key={s.id} session={s} />)}
				</div>
			</div>
		</div>
	);
}
