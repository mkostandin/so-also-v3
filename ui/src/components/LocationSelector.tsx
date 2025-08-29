import { useState } from 'react';

export default function LocationSelector({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
	const [lat, setLat] = useState('');
	const [lng, setLng] = useState('');
	return (
		<div className="flex items-end gap-2">
			<label className="text-sm">
				<span className="mb-1 block">Lat</span>
				<input value={lat} onChange={(e) => setLat(e.target.value)} className="w-28 rounded border px-2 py-1" placeholder="37.77" />
			</label>
			<label className="text-sm">
				<span className="mb-1 block">Lng</span>
				<input value={lng} onChange={(e) => setLng(e.target.value)} className="w-28 rounded border px-2 py-1" placeholder="-122.42" />
			</label>
			<button onClick={() => onSelect(parseFloat(lat), parseFloat(lng))} className="rounded bg-blue-600 px-3 py-1 text-white">Set</button>
		</div>
	);
}
