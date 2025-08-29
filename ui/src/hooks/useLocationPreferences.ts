import { useEffect, useState } from 'react';

type Prefs = {
	nearbyEnabled: boolean;
	radiusMeters: number;
};

const KEY = 'soalso:location:prefs';

export function useLocationPreferences() {
	const [prefs, setPrefs] = useState<Prefs>({ nearbyEnabled: false, radiusMeters: 50000 });

	useEffect(() => {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) setPrefs(JSON.parse(raw));
		} catch {}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(KEY, JSON.stringify(prefs));
		} catch {}
	}, [prefs]);

	return { prefs, setPrefs };
}
