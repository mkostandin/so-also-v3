import { Settings as SettingsPage } from '@/pages/Settings';
import NotificationsToggles from '@/components/NotificationsToggles';

export default function Settings() {
	return (
		<div className="space-y-4">
			<SettingsPage />
			<div className="mx-auto max-w-4xl p-6">
				<h2 className="mb-2 text-lg font-semibold">Notifications (local only)</h2>
				<NotificationsToggles topics={["general","conferences","committee_updates"]} />
			</div>
		</div>
	);
}
