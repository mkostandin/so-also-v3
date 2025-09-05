import { Hono } from 'hono';
import { eq, and, sql, gte } from 'drizzle-orm';
import * as schema from '../schema';
import { getDatabase } from '../lib/db';
import { getDatabaseUrl } from '../lib/env';

type Env = {
  [key: string]: any;
};

const committeeRoutes = new Hono<{ Bindings: Env }>();

// Utility function to convert snake_case to camelCase (duplicated from main API)
const toCamel = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;

  // Handle Date objects by converting to ISO string
  if (obj instanceof Date) return obj.toISOString();

  if (Array.isArray(obj)) return obj.map(toCamel);
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    const ck = k.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase());
    out[ck] = toCamel(v);
  }
  return out;
};

// GET /api/v1/committees - Retrieve all available committees for dropdown options
committeeRoutes.get('/', async (c) => {
  try {
    const db = await getDatabase(getDatabaseUrl());

    // Check if test data should be included
    const includeTestData = c.req.query('includeTestData') === 'true';
    const includeCounts = c.req.query('includeCounts') === 'true';

    let committeeWhere = undefined;
    let eventWhere = undefined;

    // Only filter out test data if not explicitly including it
    if (!includeTestData) {
      committeeWhere = eq(schema.committees.test_data, false);
      eventWhere = eq(schema.events.test_data, false);
    }

    // Get all committees sorted alphabetically by name
    let committees = await db
      .select({
        id: schema.committees.id,
        name: schema.committees.name,
        slug: schema.committees.slug,
        lastSeen: schema.committees.last_seen,
      })
      .from(schema.committees)
      .where(committeeWhere)
      .orderBy(schema.committees.name);

    // Optionally include event counts
    if (includeCounts) {
      const now = new Date();

      // Get event counts for each committee
      const eventCounts = await db
        .select({
          committeeSlug: schema.events.committee_slug,
          count: sql<number>`count(*)`,
        })
        .from(schema.events)
        .where(and(
          eventWhere,
          gte(schema.events.ends_at_utc, now)
        ))
        .groupBy(schema.events.committee_slug);

      // Create a map for quick lookup
      const countMap = new Map<string, number>();
      eventCounts.forEach(({ committeeSlug, count }) => {
        if (committeeSlug) {
          countMap.set(committeeSlug, count);
        }
      });

      // Add counts to committees
      committees = committees.map(committee => ({
        ...committee,
        eventCount: countMap.get(committee.slug) || 0,
      }));
    }

    return c.json(toCamel(committees));
  } catch (error) {
    console.error('Error fetching committees:', error);
    return c.json({ error: 'Failed to fetch committees' }, 500);
  }
});

// POST /api/v1/committees/sync - Sync committees collection with new entries from events
committeeRoutes.post('/sync', async (c) => {
  try {
    const db = await getDatabase(getDatabaseUrl());

    // Get unique committee/committee_slug combinations from events
    const eventCommittees = await db
      .select({
        committee: schema.events.committee,
        committeeSlug: schema.events.committee_slug,
      })
      .from(schema.events)
      .where(and(
        eq(schema.events.test_data, false),
        sql`${schema.events.committee} IS NOT NULL`,
        sql`${schema.events.committee_slug} IS NOT NULL`
      ));

    const committeesToSync = new Map<string, { name: string; slug: string }>();

    // Process and normalize committee data
    for (const event of eventCommittees) {
      if (event.committee && event.committeeSlug) {
        // Remove leading "THE" from BID committees for deduplication
        let normalizedName = event.committee.replace(/^THE\s+/i, '');

        // Validate against strict patterns
        const isValidRegional = /^[A-Z]+YPAA$/.test(normalizedName);
        const isValidAdvisory = /^[A-Z]+YPAA ADVISORY$/.test(normalizedName);
        const isValidBid = /^[A-Z\s]+BID FOR Y?PAA$/.test(normalizedName);

        if (!isValidRegional && !isValidAdvisory && !isValidBid) {
          // Skip invalid committee names (like "NECYPAA EXECUTIVE", "THE NEW HAMPSHIRE CONFERENCE OF YOUNG PEOPLE IN AA")
          continue;
        }

        // Normalize to ALL CAPS
        normalizedName = normalizedName.toUpperCase();

        committeesToSync.set(event.committeeSlug, {
          name: normalizedName,
          slug: event.committeeSlug,
        });
      }
    }

    const results = {
      processed: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
    };

    // Sync committees to database
    for (const [slug, committeeData] of committeesToSync) {
      results.processed++;

      // Check if committee already exists
      const existing = await db
        .select()
        .from(schema.committees)
        .where(eq(schema.committees.slug, slug))
        .limit(1);

      if (existing.length === 0) {
        // Insert new committee
        await db.insert(schema.committees).values({
          name: committeeData.name,
          slug: committeeData.slug,
          test_data: false,
          last_seen: new Date(),
        });
        results.inserted++;
      } else {
        // Update last_seen timestamp
        await db
          .update(schema.committees)
          .set({ last_seen: new Date() })
          .where(eq(schema.committees.slug, slug));
        results.updated++;
      }
    }

    // Get total count of committees after sync
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.committees)
      .where(eq(schema.committees.test_data, false));

    return c.json({
      success: true,
      results,
      totalCommittees: totalCount[0].count,
    });

  } catch (error) {
    console.error('Error syncing committees:', error);
    return c.json({ error: 'Failed to sync committees' }, 500);
  }
});

export { committeeRoutes };
