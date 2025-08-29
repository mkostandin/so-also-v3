import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import ConferenceCard from '@/components/ConferenceCard';
import type { Conference } from '@/lib/api-client';

export default function Conferences() {
	const [items, setItems] = useState<Conference[]>([]);
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
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Conferences</h2>
				<Link
					to="/app/submit-conference"
					className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					Submit Conference
				</Link>
			</div>

			{loading ? (
				<div className="rounded border p-3 text-sm">Loading…</div>
			) : items.length === 0 ? (
				<div className="text-center py-8">
					<div className="text-gray-500 dark:text-gray-400 mb-4">
						No conferences found.
					</div>
					<Link
						to="/app/submit-conference"
						className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Submit Your First Conference
					</Link>
				</div>
			) : (
				<div className="grid gap-3">
					{items.map((c) => <ConferenceCard key={c.id} conf={c} />)}
				</div>
			)}
		</div>
	);
}
