import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorOverlay from '@/components/ErrorOverlay';

export default function Landing() {
	const [navigationError, setNavigationError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleAppNavigation = async (e: React.MouseEvent) => {
		e.preventDefault();

		try {
			// Add a small delay for better UX
			await new Promise(resolve => setTimeout(resolve, 500));

			// Try React Router navigation first
			navigate('/app');

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Navigation failed';
			setNavigationError(errorMessage);
		}
	};

	const handleRetry = () => {
		setNavigationError(null);
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black" data-loaded="true">
			<h1 className="text-4xl font-bold mb-4">So Also</h1>
			<p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md text-center">
				Find and share events, meetings, and conferences. The app runs as a PWA under /app.
			</p>

			{/* Primary navigation button */}
			<button
				onClick={handleAppNavigation}
				className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 active:bg-blue-800 transition-colors"
				style={{ touchAction: 'manipulation' }}
			>
				Open App
			</button>

			{/* Fallback link for browsers that don't support button clicks */}
			<div className="mt-4">
				<Link
					to="/app/"
					className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
				>
					Or click here if button doesn't work
				</Link>
			</div>


			{/* Error overlay for navigation failures */}
			<ErrorOverlay
				error={navigationError ? `Failed to navigate to app: ${navigationError}` : undefined}
				onRetry={handleRetry}
			/>
		</div>
	);
}
