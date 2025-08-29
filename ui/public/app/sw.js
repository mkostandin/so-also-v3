// Minimal app-scoped service worker for So Also
// Scope is set by registration to /app/

const CACHE_NAME = 'so-also-app-cache-v1';
const APP_PREFIX = '/app/';

self.addEventListener('install', (event) => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil((async () => {
		const keys = await caches.keys();
		await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
		await self.clients.claim();
	})());
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Only handle requests within /app/
	if (!url.pathname.startsWith(APP_PREFIX)) {
		return;
	}

	// Avoid caching POST/PUT/etc.
	if (request.method !== 'GET') return;

	event.respondWith((async () => {
		try {
			const networkResponse = await fetch(request);
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, networkResponse.clone());
			return networkResponse;
		} catch (err) {
			const cached = await caches.match(request);
			if (cached) return cached;
			// Fallback to root app shell for navigations
			if (request.mode === 'navigate') {
				return caches.match(APP_PREFIX);
			}
			throw err;
		}
	})());
});
