import { useEffect, useMemo, useState } from 'react';
import { api, EventItem } from '@/lib/api-client';

function useQuery() {
	return useMemo(() => new URLSearchParams(window.location.search), []);
}

export default function EmbedView() {
	const q = useQuery();
	const committee = q.get('committee') || undefined;
	const view = (q.get('view') as 'map' | 'list' | 'calendar') || 'list';
	const range = q.get('range') || '30';
	const [items, setItems] = useState<EventItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const appManifest = document.querySelector('link[rel="manifest"][data-scope="app"]');
		if (appManifest) appManifest.remove();
	}, []);

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			try {
				const data = await api.browse({ committee, range });
				if (mounted) setItems(data);
			} finally { setLoading(false); }
		})();
		return () => { mounted = false; };
	}, [committee, range]);

	return (
		<div className="min-h-[300px] p-4 text-sm">
			{loading ? (
				<div className="rounded border p-3">Loading…</div>
			) : view === 'list' ? (
				<ul className="divide-y rounded border bg-white">
					{items.map((it) => (
						<li key={it.id} className="p-3">
							<div className="font-medium">{it.name}</div>
							{it.startsAtUtc && <div className="text-xs text-gray-500">{new Date(it.startsAtUtc).toLocaleString()}</div>}
						</li>
					))}
				</ul>
			) : view === 'map' ? (
				<div className="rounded border p-3">Map embed coming soon</div>
			) : (
				<div className="rounded border p-3">Calendar embed coming soon</div>
			)}
		</div>
	);
}
