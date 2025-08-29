import { useEffect, useState } from 'react';

const KEY = 'soalso:notify:topics';

export default function NotificationsToggles({ topics }: { topics: string[] }) {
	const [enabled, setEnabled] = useState<Record<string, boolean>>({});
	useEffect(() => {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) setEnabled(JSON.parse(raw));
		} catch {}
	}, []);
	useEffect(() => {
		try { localStorage.setItem(KEY, JSON.stringify(enabled)); } catch {}
	}, [enabled]);

	return (
		<div className="space-y-2">
			{topics.map((t) => (
				<label key={t} className="flex items-center justify-between rounded border p-2 text-sm">
					<span>{t}</span>
					<input type="checkbox" checked={!!enabled[t]} onChange={(e) => setEnabled({ ...enabled, [t]: e.target.checked })} />
				</label>
			))}
		</div>
	);
}
