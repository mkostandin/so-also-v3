import { useState } from 'react';
import { api } from '@/lib/api-client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function FlagButton(props: {
	targetType: 'event'|'conference'|'session'|'series';
	targetId: string;
	committeeSlug?: string;
	className?: string
}) {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState('incorrect_time');
	const [message, setMessage] = useState('');
	const [email, setEmail] = useState('');
	const [honeypot, setHoneypot] = useState('');
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
			setOpen(false);
		} catch (e: any) {
			setError(e?.message || 'Failed');
		} finally {
			setSending(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{props.className ? (
					<span className={props.className}>Report issue</span>
				) : (
					<Button variant="destructive" size="sm">Report issue</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Report an issue</DialogTitle>
					<DialogDescription>
						Help us improve by reporting any issues with this event.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-3">
					<label className="block text-sm">
						<span className="mb-1 block">Reason</span>
						<Select value={reason} onValueChange={setReason}>
							<SelectTrigger>
								<SelectValue placeholder="Select reason" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="incorrect_time">Incorrect time</SelectItem>
								<SelectItem value="wrong_address">Wrong address</SelectItem>
								<SelectItem value="broken_link">Broken link</SelectItem>
								<SelectItem value="duplicate">Duplicate</SelectItem>
								<SelectItem value="not_ypaa">Not YPAA</SelectItem>
								<SelectItem value="inappropriate">Inappropriate</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</label>
					<label className="block text-sm">
						<span className="mb-1 block">Message (optional)</span>
						<Textarea maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
					</label>
					<label className="block text-sm">
						<span className="mb-1 block">Email (optional)</span>
						<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
					</label>
					<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" aria-hidden="true" />
					<div className="flex items-center justify-end gap-2">
						<Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
						<Button onClick={submit} disabled={sending}>Submit</Button>
					</div>
					{error && <div className="text-sm text-red-600">{error}</div>}
				</div>
			</DialogContent>
		</Dialog>
	);
}
