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
	eventType?: 'Event' | 'Committee Meeting' | 'Conference' | 'YPAA Meeting' | 'Other';
	imageUrls?: string[];
	address?: string | null;
	city?: string | null;
	stateProv?: string | null;
	country?: string | null;
	postal?: string | null;
	flyerUrl?: string | null;
	websiteUrl?: string | null;
	contactEmail?: string | null;
	contactPhone?: string | null;
	committee?: string | null;
	committeeSlug?: string | null;
};

export type Conference = {
	id: string;
	name: string;
	city?: string | null;
	programUrl?: string | null;
	hotelMapUrl?: string | null;
	flyerUrl?: string | null;
	websiteUrl?: string | null;
	imageUrls?: string[] | null;
	startsAtUtc?: string | null;
	endsAtUtc?: string | null;
	status: 'pending' | 'approved' | 'rejected';
	createdAt?: string;
	updatedAt?: string;
};

export type ConferenceSession = {
	id: string;
	conferenceId: string;
	title: string;
	type: 'workshop' | 'panel' | 'main' | 'marathon' | 'dance' | 'event' | 'main_meeting';
	room?: string | null;
	desc?: string | null;
	startsAtUtc?: string | null;
	endsAtUtc?: string | null;
	status: 'pending' | 'approved' | 'rejected';
	speaker?: string | null;
};

import { debugSettings } from '@/lib/debug-settings';

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
	let url = buildUrl(path);

	// Add includeTestData parameter if debug mode is enabled and it's a GET request
	if (debugSettings.isDebugModeEnabled() && (!init || init.method === 'GET' || !init.method)) {
		const separator = url.includes('?') ? '&' : '?';
		url += `${separator}includeTestData=true`;
	}

	const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });

	if (!res.ok) {
		console.error('API Error:', res.status, await res.text());
		throw new Error(`HTTP ${res.status}`);
	}

	return res.json();
}

export type Committee = {
	id: string;
	name: string; // ALL CAPS normalized name
	slug: string;
	lastSeen: string;
	eventCount?: number; // Optional event count for enhanced UX
};

export const api = {
	getCommittees: (includeCounts: boolean = false) => {
		const params = includeCounts ? '?includeCounts=true' : '';
		return http<Committee[]>(`/committees${params}`);
	},
	browse: (params: { committees?: string[]; committee?: string; range?: string | number; lat?: number; lng?: number; radius?: number }) => {
		const usp = new URLSearchParams();
		// Support both single committee (backward compatibility) and multiple committees
		if (params.committees && params.committees.length > 0) {
			params.committees.forEach(committee => usp.append('committee', committee));
		} else if (params.committee) {
			usp.set('committee', params.committee);
		}
		if (params.range) usp.set('range', String(params.range));
		if (params.lat !== undefined) usp.set('lat', String(params.lat));
		if (params.lng !== undefined) usp.set('lng', String(params.lng));
		if (params.radius !== undefined) usp.set('radius', String(params.radius));
		return http<EventItem[]>(`/browse?${usp.toString()}`);
	},
	events: (params: { committees?: string[]; committee?: string; range?: string | number }) => {
		const usp = new URLSearchParams();
		// Support both single committee (backward compatibility) and multiple committees
		if (params.committees && params.committees.length > 0) {
			params.committees.forEach(committee => usp.append('committee', committee));
		} else if (params.committee) {
			usp.set('committee', params.committee);
		}
		if (params.range) usp.set('range', String(params.range));
		return http<EventItem[]>(`/events?${usp.toString()}`);
	},
	occurrences: (params: { committees?: string[]; committee?: string; range?: string | number }) => {
		const usp = new URLSearchParams();
		// Support both single committee (backward compatibility) and multiple committees
		if (params.committees && params.committees.length > 0) {
			params.committees.forEach(committee => usp.append('committee', committee));
		} else if (params.committee) {
			usp.set('committee', params.committee);
		}
		if (params.range) usp.set('range', String(params.range));
		return http<EventItem[]>(`/occurrences?${usp.toString()}`);
	},
	conferences: () => http<Conference[]>(`/conferences`),
	conference: (id: string) => http<Conference>(`/conferences/${id}`),
	sessions: (id: string) => http<ConferenceSession[]>(`/conferences/${id}/sessions`),
	createConference: (conferenceData: Partial<Conference>) => {
		// Transform camelCase to snake_case for backend compatibility
		const transformedData = {
			name: conferenceData.name,
			city: conferenceData.city,
			description: conferenceData.description,
			starts_at_utc: conferenceData.startsAtUtc,
			ends_at_utc: conferenceData.endsAtUtc,
			website_url: conferenceData.websiteUrl,
			program_url: conferenceData.programUrl,
			hotel_map_url: conferenceData.hotelMapUrl,
			flyer_url: conferenceData.flyerUrl,
			image_urls: conferenceData.imageUrls,
			status: conferenceData.status,
		};
		return http<Conference>(`/conferences`, { method: 'POST', body: JSON.stringify(transformedData) });
	},
	flags: (payload: {
		targetType: 'event' | 'conference' | 'session' | 'series';
		targetId: string;
		committeeSlug?: string;
		reason: 'incorrect_time' | 'wrong_address' | 'broken_link' | 'duplicate' | 'not_ypaa' | 'inappropriate' | 'other';
		message?: string;
		contactEmail?: string;
		honeypot?: string;
		deviceId?: string;
	}) => http(`/flags`, { method: 'POST', body: JSON.stringify(payload) }),
	uploadImage: async (file: File) => {
		const formData = new FormData();
		formData.append('file', file);
		const response = await fetch(buildUrl('/upload-image'), {
			method: 'POST',
			body: formData,
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return response.json() as Promise<{ url: string; filename: string; size: number; type: string }>;
	},
	createEvent: (eventData: Record<string, unknown>) => http('/events', { method: 'POST', body: JSON.stringify(eventData) }),
};
