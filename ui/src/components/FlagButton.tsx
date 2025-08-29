import { useState } from 'react';
import { api } from '@/lib/api-client';

export default function FlagButton(props: { targetType: 'event'|'conference'|'session'|'series'; targetId: string; committeeSlug?: string }) {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState('incorrect_time');
	const [message, setMessage] = useState('');
	const [email, setEmail] = useState('');
	const [honeypot, setHoneypot] = useState('');
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sent, setSent] = useState(false);

	const submit = async () => {
		setSending(true);
		setError(null);
		try {
			const deviceId = localStorage.getItem('soalso:device') || crypto.randomUUID();
			localStorage.setItem('soalso:device', deviceId);
			await api.flags({
				targetType: props.targetType,
				targetId: props.targetId,
				committeeSlug: props.committeeSlug,
				reason,
				message: message || undefined,
				contactEmail: email || undefined,
				honeypot,
				deviceId,
			});
			setSent(true);
			setOpen(false);
		} catch (e: any) {
			setError(e?.message || 'Failed');
		} finally {
			setSending(false);
		}
	};

	return (
		<div>
			<button onClick={() => setOpen(true)} className="rounded bg-red-600 px-3 py-1 text-white">Report issue</button>
			{open && (
				<div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-md rounded bg-white p-4 shadow">
						<h3 className="mb-2 text-lg font-semibold">Report an issue</h3>
						<label className="mb-2 block text-sm">
							<span className="mb-1 block">Reason</span>
							<select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded border px-2 py-1">
								<option value="incorrect_time">Incorrect time</option>
								<option value="wrong_address">Wrong address</option>
								<option value="broken_link">Broken link</option>
								<option value="duplicate">Duplicate</option>
								<option value="not_ypaa">Not YPAA</option>
								<option value="inappropriate">Inappropriate</option>
								<option value="other">Other</option>
							</select>
						</label>
						<label className="mb-2 block text-sm">
							<span className="mb-1 block">Message (optional)</span>
							<textarea maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded border p-2" rows={3} />
						</label>
						<label className="mb-2 block text-sm">
							<span className="mb-1 block">Email (optional)</span>
							<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border px-2 py-1" />
						</label>
						{/* Honeypot */}
						<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" aria-hidden="true" />
						<div className="mt-3 flex items-center justify-end gap-2">
							<button onClick={() => setOpen(false)} className="rounded px-3 py-1">Cancel</button>
							<button onClick={submit} disabled={sending} className="rounded bg-blue-600 px-3 py-1 text-white">Submit</button>
						</div>
						{error && <div className="mt-2 text-sm text-red-600">{error}</div>}
					</div>
				</div>
			)}
		</div>
	);
}
