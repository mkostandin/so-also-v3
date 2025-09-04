import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Conference } from '@/lib/api-client';

export default function ConferenceCard({ conf }: { conf: Conference }) {
	const [imageError, setImageError] = useState(false);

	const formatDateRange = (start: string, end?: string) => {
		const startDate = new Date(start);
		if (!end) {
			return startDate.toLocaleDateString();
		}
		const endDate = new Date(end);
		if (startDate.toDateString() === endDate.toDateString()) {
			return startDate.toLocaleDateString();
		}
		return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
	};

	const handleImageError = () => {
		setImageError(true);
	};

	return (
		<div className="rounded-lg border bg-white dark:bg-gray-900 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
			{/* Conference Image */}
			{conf.imageUrls && conf.imageUrls.length > 0 && !imageError && (
				<div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
					<img
						src={conf.imageUrls[0]}
						alt={`${conf.name} conference image`}
						className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
						onError={handleImageError}
						loading="lazy"
					/>
				</div>
			)}

			{/* Fallback for no image or error */}
			{(!conf.imageUrls || conf.imageUrls.length === 0 || imageError) && (
				<div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
					<div className="text-center">
						<svg className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
						</svg>
						<p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Conference</p>
					</div>
				</div>
			)}

			{/* Conference Info */}
			<div className="p-4">
				<Link to={`/app/conferences/${conf.id}`} className="block group">
					<h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
						{conf.name}
					</h3>
				</Link>

				{conf.city && (
					<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
						📍 {conf.city}
					</div>
				)}

				{(conf.startsAtUtc || conf.endsAtUtc) && (
					<div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
						      🗓️ {(conf.startsAtUtc && conf.endsAtUtc) ? formatDateRange(conf.startsAtUtc, conf.endsAtUtc) : 'Date TBD'}
					</div>
				)}

				{/* Action Links */}
				<div className="flex flex-wrap gap-2 mt-3">
					{conf.websiteUrl && (
						<a
							href={conf.websiteUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
						>
							🌐 Website
						</a>
					)}

					{conf.programUrl && (
						<a
							href={conf.programUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
						>
							📋 Program
						</a>
					)}

					{conf.hotelMapUrl && (
						<a
							href={conf.hotelMapUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
						>
							🏨 Map
						</a>
					)}

					<Link
						to={`/app/conferences/${conf.id}`}
						className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
					>
						📅 View Details
					</Link>
				</div>
			</div>
		</div>
	);
}
