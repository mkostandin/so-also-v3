import { generateInstancesForMonths } from '../lib/recurrence';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';
import { getDatabase } from '../lib/db';
import { getDatabaseUrl } from '../lib/env';

export async function materializeForSeries(seriesRow: any, monthsAhead: number, db?: any) {
	const database = db || await getDatabase(getDatabaseUrl());
	const instances = generateInstancesForMonths(seriesRow, monthsAhead);
	let inserted = 0;
	let updated = 0;
	for (const inst of instances) {
		const payload = {
			series_id: seriesRow.id,
			name: seriesRow.name,
			type: seriesRow.type,
			committee: seriesRow.committee,
			committee_slug: seriesRow.committee_slug,
			starts_at_local: inst.startsAtLocal,
			ends_at_local: inst.endsAtLocal,
			starts_at_utc: new Date(inst.startsAtUtc) as any,
			ends_at_utc: new Date(inst.endsAtUtc) as any,
			address: seriesRow.address,
			city: seriesRow.city,
			state_prov: seriesRow.state_prov,
			country: seriesRow.country,
			postal: seriesRow.postal,
			latitude: seriesRow.latitude,
			longitude: seriesRow.longitude,
			status: seriesRow.status,
			notify_topic: seriesRow.notify_topic,
		};
		await database.insert(schema.occurrences).values(payload).onConflictDoNothing();
		inserted++;
	}
	return { inserted, updated };
}

export async function materializeRollingWindow(monthsAhead: number) {
	const db = await getDatabase(getDatabaseUrl());
	const allSeries = await db.select().from(schema.series).where(eq(schema.series.status, 'approved'));
	let totals = { inserted: 0, updated: 0 };
	for (const s of allSeries) {
		const res = await materializeForSeries(s, monthsAhead, db);
		totals.inserted += res.inserted;
		totals.updated += res.updated;
	}
	return totals;
}
