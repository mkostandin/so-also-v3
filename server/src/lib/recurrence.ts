import { DateTime } from 'luxon';

type SeriesLike = {
	id: string;
	name: string;
	type: string;
	committee?: string | null;
	committee_slug?: string | null;
	timezone: string;
	start_time_local: string; // HH:mm
	duration_mins: number;
	rrule: {
		freq: 'weekly'|'monthly';
		interval: number;
		by_weekday?: string[];
		by_set_pos?: number[];
		by_month?: number[];
		until?: string | null;
		count?: number | null;
	};
	ex_dates?: string[] | null;
	overrides?: Record<string, any> | null;
	address?: string | null;
	city?: string | null;
	state_prov?: string | null;
	country?: string | null;
	postal?: string | null;
	latitude?: any;
	longitude?: any;
	status: 'pending'|'approved'|'rejected';
	notify_topic?: string | null;
};

export type GeneratedInstance = {
	startsAtLocal: string;
	endsAtLocal: string;
	startsAtUtc: string;
	endsAtUtc: string;
};

const weekdayToLuxon = (wd: string): number => {
	const map: Record<string, number> = { SU: 7, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
	return map[wd] ?? 1;
};

export function generateWeekly(series: SeriesLike, from: DateTime, to: DateTime): DateTime[] {
	const weekdays = series.rrule.by_weekday ?? ['MO'];
	const interval = series.rrule.interval || 1;
	let current = from.startOf('week');
	const matches: DateTime[] = [];
	while (current <= to) {
		for (const wd of weekdays) {
			const day = current.set({ weekday: weekdayToLuxon(wd) });
			if (day < from || day > to) continue;
			if (Math.floor(day.diff(from.startOf('week'), 'weeks').weeks) % interval === 0) {
				matches.push(day);
			}
		}
		current = current.plus({ weeks: 1 });
	}
	return matches.sort((a,b) => a.toMillis() - b.toMillis());
}

export function generateMonthlyBySetPos(series: SeriesLike, from: DateTime, to: DateTime): DateTime[] {
	const weekdays = series.rrule.by_weekday ?? ['MO'];
	const setPos = series.rrule.by_set_pos ?? [1];
	const interval = series.rrule.interval || 1;
	let cursor = from.startOf('month');
	const result: DateTime[] = [];
	while (cursor <= to) {
		const monthStart = cursor.startOf('month');
		const monthEnd = cursor.endOf('month');
		for (const wd of weekdays) {
			const weekday = weekdayToLuxon(wd);
			const days: DateTime[] = [];
			let d = monthStart.set({ weekday });
			if (d < monthStart) d = d.plus({ weeks: 1 });
			while (d <= monthEnd) {
				days.push(d);
				d = d.plus({ weeks: 1 });
			}
			for (const pos of setPos) {
				const idx = pos > 0 ? pos - 1 : days.length + pos;
				const date = days[idx];
				if (date && date >= from && date <= to) {
					result.push(date);
				}
			}
		}
		cursor = cursor.plus({ months: interval });
	}
	return result.sort((a,b) => a.toMillis() - b.toMillis());
}

export function generateInstancesForMonths(series: SeriesLike, monthsAhead: number): GeneratedInstance[] {
	const now = DateTime.now().setZone(series.timezone);
	const from = now.startOf('day');
	const to = from.plus({ months: monthsAhead }).endOf('day');
	const [hh, mm] = series.start_time_local.split(':').map((n) => parseInt(n, 10));
	const duration = series.duration_mins;

	let dates: DateTime[] = [];
	if (series.rrule.freq === 'weekly') {
		dates = generateWeekly(series, from, to);
	} else if (series.rrule.freq === 'monthly') {
		dates = generateMonthlyBySetPos(series, from, to);
	}

	const exDates = new Set((series.ex_dates ?? []).map((d) => d));
	return dates
		.filter((d) => !exDates.has(d.toISODate()!))
		.map((d) => {
			const startLocal = d.set({ hour: hh, minute: mm, second: 0, millisecond: 0 });
			const endLocal = startLocal.plus({ minutes: duration });
			return {
				startsAtLocal: startLocal.toISO({ includeOffset: false })!,
				endsAtLocal: endLocal.toISO({ includeOffset: false })!,
				startsAtUtc: startLocal.toUTC().toISO()!,
				endsAtUtc: endLocal.toUTC().toISO()!,
			};
		});
}
