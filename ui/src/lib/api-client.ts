export type EventItem = {
	id: string;
	name: string;
	description?: string | null;
	startsAtUtc?: string | null;
	endsAtUtc?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	itemType?: 'event' | 'occurrence';
	distanceMeters?: number;
};

const baseUrl = import.meta.env.VITE_API_URL || '';

function buildUrl(path: string): string {
	const p = path.startsWith('/') ? path : `/${path}`;
	if (baseUrl) {
		// Use URL to safely join base and path without breaking protocol slashes
		return new URL(`/api/v1${p}`, baseUrl).toString();
	}
	return `/api/v1${p}`;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
	const url = buildUrl(path);
	const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}

export const api = {
	browse: (params: { committee?: string; range?: string | number; lat?: number; lng?: number; radius?: number }) => {
		const usp = new URLSearchParams();
		if (params.committee) usp.set('committee', params.committee);
		if (params.range) usp.set('range', String(params.range));
		if (params.lat !== undefined) usp.set('lat', String(params.lat));
		if (params.lng !== undefined) usp.set('lng', String(params.lng));
		if (params.radius !== undefined) usp.set('radius', String(params.radius));
		return http<EventItem[]>(`/browse?${usp.toString()}`);
	},
	events: (params: { committee?: string; range?: string | number }) => {
		const usp = new URLSearchParams();
		if (params.committee) usp.set('committee', params.committee);
		if (params.range) usp.set('range', String(params.range));
		return http<EventItem[]>(`/events?${usp.toString()}`);
	},
	occurrences: (params: { committee?: string; range?: string | number }) => {
		const usp = new URLSearchParams();
		if (params.committee) usp.set('committee', params.committee);
		if (params.range) usp.set('range', String(params.range));
		return http<EventItem[]>(`/occurrences?${usp.toString()}`);
	},
	conferences: () => http<any[]>(`/conferences`),
	conference: (id: string) => http<any>(`/conferences/${id}`),
	sessions: (id: string) => http<any[]>(`/conferences/${id}/sessions`),
	flags: (payload: any) => http(`/flags`, { method: 'POST', body: JSON.stringify(payload) }),
};
