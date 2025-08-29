import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import ConferenceCard from '@/components/ConferenceCard';

export default function Conferences() {
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			try {
				const data = await api.conferences();
				if (mounted) setItems(data);
			} finally { setLoading(false); }
		})();
		return () => { mounted = false; };
	}, []);
	return (
		<div className="space-y-3">
			<h2 className="text-xl font-semibold">Conferences</h2>
			{loading ? <div className="rounded border p-3 text-sm">Loading…</div> : (
				<div className="grid gap-3">
					{items.map((c) => <ConferenceCard key={c.id} conf={c} />)}
				</div>
			)}
		</div>
	);
}
