import { NavLink } from 'react-router-dom';

export default function BottomTabs() {
	const base = '/app';
	const tabs = [
		{ to: `${base}/map`, label: 'Browse' },
		{ to: `${base}/submit`, label: 'Submit' },
		{ to: `${base}/conferences`, label: 'Conferences' },
		{ to: `${base}/settings`, label: 'Settings' },
	];
	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-950/60">
			<ul className="mx-auto grid max-w-xl grid-cols-4 gap-0">
				{tabs.map((t) => (
					<li key={t.to} className="text-center">
						<NavLink
							to={t.to}
							className={({ isActive }) => `block py-3 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
						>
							{t.label}
						</NavLink>
					</li>
				))}
			</ul>
		</nav>
	);
}
