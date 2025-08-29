import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { generateInstancesForMonths } from '../src/lib/recurrence';

describe('recurrence generation', () => {
	it('generates weekly occurrences', () => {
		const series: any = {
			id: 's1', name: 'Weekly', type: 'Committee Meeting', timezone: 'America/New_York', start_time_local: '19:00', duration_mins: 60,
			rrule: { freq: 'weekly', interval: 1, by_weekday: ['MO'] }, ex_dates: [], status: 'approved'
		};
		const out = generateInstancesForMonths(series, 1);
		expect(out.length).toBeGreaterThan(3);
	});

	it('handles DST transition safely', () => {
		const series: any = {
			id: 's2', name: 'DST', type: 'Committee Meeting', timezone: 'America/New_York', start_time_local: '01:30', duration_mins: 90,
			rrule: { freq: 'weekly', interval: 1, by_weekday: ['SU'] }, ex_dates: [], status: 'approved'
		};
		const out = generateInstancesForMonths(series, 2);
		// Ensure ISO outputs exist and are valid
		for (const inst of out.slice(0, 4)) {
			expect(inst.startsAtLocal).toMatch(/T/);
			expect(inst.startsAtUtc).toMatch(/Z$/);
		}
	});
});
