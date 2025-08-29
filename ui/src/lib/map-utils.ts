export function createMarker(lat: number, lng: number, data?: any) {
	return { lat, lng, data };
}

export function clusterMarkers(markers: Array<{ lat: number; lng: number }>) {
	return markers; // stub
}
