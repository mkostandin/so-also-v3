import { useNavigate, useParams } from 'react-router-dom';
import FlagButton from '@/components/FlagButton';

export default function EventDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const handleBack = () => {
		if (window.history.length > 1) navigate(-1);
		else navigate('/app/map');
	};
	return (
		<div className="space-y-3">
			<button onClick={handleBack} className="rounded bg-gray-200 px-3 py-1 text-sm dark:bg-gray-800">Back</button>
			<div className="flex items-start justify-between">
				<h2 className="text-xl font-semibold">Event</h2>
				{id && <FlagButton targetType="event" targetId={id} />}
			</div>
			<p className="text-sm text-gray-600 dark:text-gray-300">Detail for {id}</p>
		</div>
	);
}
