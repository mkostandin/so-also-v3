import { NavLink, Outlet, useLocation } from 'react-router-dom';

export default function MapIndex() {
	const location = useLocation();
	const base = '/app/map';
	const items = [
		{ to: `${base}`, label: 'Map', end: true },
		{ to: `${base}/list`, label: 'List' },
		{ to: `${base}/calendar`, label: 'Calendar' },
	];
	return (
		<div className="pb-16">
			<div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur dark:bg-gray-900/60">
				<div className="mx-auto flex max-w-3xl items-center gap-2 p-2">
					{items.map((i) => (
						<NavLink
							key={i.to}
							to={i.to}
							end={i.end as any}
							className={({ isActive }) => `flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}`}
						>
							{i.label}
						</NavLink>
					))}
				</div>
			</div>
			<div className="mx-auto max-w-3xl p-2">
				<Outlet />
			</div>
		</div>
	);
}
