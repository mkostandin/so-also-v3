import { Link } from 'react-router-dom';

export default function Landing() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black">
			<h1 className="text-4xl font-bold mb-4">So Also</h1>
			<p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md text-center">
				Find and share events, meetings, and conferences. The app runs as a PWA under /app.
			</p>
			<Link to="/app/" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
				Open App
			</Link>
		</div>
	);
}
