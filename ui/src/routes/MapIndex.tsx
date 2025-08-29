import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MapIndex() {
	const location = useLocation();
	const navigate = useNavigate();
	const base = '/app/map';
	const routeToTab = (pathname: string) => {
		if (pathname.startsWith(`${base}/calendar`)) return 'calendar';
		if (pathname.startsWith(`${base}/list`)) return 'list';
		return 'map';
	};
	const current = routeToTab(location.pathname);

	const onValueChange = (val: string) => {
		if (val === 'map') navigate(base);
		else navigate(`${base}/${val}`);
	};

	return (
		<div className="pb-16">
			<div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur dark:bg-gray-900/60">
				<div className="mx-auto max-w-3xl p-2">
					<Tabs value={current} onValueChange={onValueChange}>
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="map">Map</TabsTrigger>
							<TabsTrigger value="list">List</TabsTrigger>
							<TabsTrigger value="calendar">Calendar</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>
			<div className="mx-auto max-w-3xl p-2">
				<Outlet />
			</div>
		</div>
	);
}
