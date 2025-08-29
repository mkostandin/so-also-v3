import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware, requireUser, getUserOrNull } from './middleware/auth';
import { getDatabase, testDatabaseConnection } from './lib/db';
import { setEnvContext, clearEnvContext, getDatabaseUrl, getEnv, isDevelopment } from './lib/env';
import * as schema from './schema';
import { z } from 'zod';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { haversineMeters } from './lib/location';

type Env = {
  RUNTIME?: string;
  [key: string]: any;
};

const app = new Hono<{ Bindings: Env }>();

// In Node.js environment, set environment context from process.env
if (typeof process !== 'undefined' && process.env) {
  setEnvContext(process.env);
}

// Environment context middleware - detect runtime using RUNTIME env var
app.use('*', async (c, next) => {
  if (c.env?.RUNTIME === 'cloudflare') {
    setEnvContext(c.env);
  }
  
  await next();
  // No need to clear context - env vars are the same for all requests
  // In fact, clearing the context would cause the env vars to potentially be unset for parallel requests
});

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: (origin) => {
    const allowed = getEnv('PAGES_ORIGIN');
    if (isDevelopment() || !allowed) return '*';
    // Honor exact origin match in production if provided
    return origin === allowed;
  },
  credentials: false,
}));

// Health check route - public
app.get('/', (c) => c.json({ status: 'ok', message: 'API is running' }));

// API routes
const api = new Hono();

// Utils
const toCamel = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    const ck = k.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase());
    out[ck] = toCamel(v);
  }
  return out;
};

// haversineMeters imported from lib

// Schemas
const createEventSchema = z.object({
  name: z.string().min(2),
  eventType: z.enum(['Event','Committee Meeting','Conference','YPAA Meeting','Other']),
  committee: z.string().optional(),
  committeeSlug: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  stateProv: z.string().optional(),
  country: z.string().optional(),
  postal: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  flyerUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  startsAtUtc: z.string().datetime(),
  endsAtUtc: z.string().datetime(),
});

const flagSchema = z.object({
  targetType: z.enum(['event','conference','session','series']),
  targetId: z.string(),
  committeeSlug: z.string().optional(),
  reason: z.enum(['incorrect_time','wrong_address','broken_link','duplicate','not_ypaa','inappropriate','other']),
  message: z.string().max(500).optional(),
  contactEmail: z.string().email().optional(),
  honeypot: z.string().optional(),
  deviceId: z.string().optional(),
});

// Database test route - public for testing
api.get('/db-test', async (c) => {
  try {
    // Use external DB URL if available, otherwise use local PostgreSQL database server
    // Note: In development, the port is dynamically allocated by port-manager.js
    const defaultLocalConnection = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5502/postgres';
    const dbUrl = getDatabaseUrl() || defaultLocalConnection;
    
    const db = await getDatabase(dbUrl);
    const isHealthy = await testDatabaseConnection();
    
    if (!isHealthy) {
      return c.json({
        error: 'Database connection is not healthy',
        timestamp: new Date().toISOString(),
      }, 500);
    }
    
    const result = await db.select().from(schema.users).limit(5);
    
    return c.json({
      message: 'Database connection successful!',
      users: result,
      connectionHealthy: isHealthy,
      usingLocalDatabase: !getDatabaseUrl(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database test error:', error);
    return c.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// Public GET: events
api.get('/events', async (c) => {
  const db = await getDatabase(getDatabaseUrl());
  const committee = c.req.query('committee') || undefined;
  const rangeDays = parseInt(c.req.query('range') || '90');
  const now = new Date();
  const until = new Date(now.getTime() + rangeDays * 86400000);
  const where = committee
    ? and(eq(schema.events.status, 'approved'), gte(schema.events.ends_at_utc, now), gte(schema.events.starts_at_utc, new Date(now.getTime() - 90 * 86400000)), eq(schema.events.committee_slug, committee))
    : and(eq(schema.events.status, 'approved'), gte(schema.events.ends_at_utc, now));
  const rows = await db.select().from(schema.events).where(where).limit(500);
  return c.json(toCamel(rows));
});

// Public GET: occurrences
api.get('/occurrences', async (c) => {
  const db = await getDatabase(getDatabaseUrl());
  const committee = c.req.query('committee') || undefined;
  const now = new Date();
  const where = committee
    ? and(eq(schema.occurrences.status, 'approved'), gte(schema.occurrences.ends_at_utc, now), eq(schema.occurrences.committee_slug, committee))
    : and(eq(schema.occurrences.status, 'approved'), gte(schema.occurrences.ends_at_utc, now));
  const rows = await db.select().from(schema.occurrences).where(where).limit(500);
  return c.json(toCamel(rows));
});

// Public GET: browse merged
api.get('/browse', async (c) => {
  const db = await getDatabase(getDatabaseUrl());
  const committee = c.req.query('committee') || undefined;
  const rangeDays = parseInt(c.req.query('range') || '90');
  const lat = c.req.query('lat');
  const lng = c.req.query('lng');
  const radius = c.req.query('radius');
  const now = new Date();
  const until = new Date(now.getTime() + rangeDays * 86400000);
  const eventsWhere = committee
    ? and(eq(schema.events.status, 'approved'), gte(schema.events.ends_at_utc, now), eq(schema.events.committee_slug, committee))
    : and(eq(schema.events.status, 'approved'), gte(schema.events.ends_at_utc, now));
  const occWhere = committee
    ? and(eq(schema.occurrences.status, 'approved'), gte(schema.occurrences.ends_at_utc, now), eq(schema.occurrences.committee_slug, committee))
    : and(eq(schema.occurrences.status, 'approved'), gte(schema.occurrences.ends_at_utc, now));
  const [evRows, ocRows] = await Promise.all([
    db.select().from(schema.events).where(eventsWhere).limit(1000),
    db.select().from(schema.occurrences).where(occWhere).limit(1000),
  ]);

  type Item = any & { starts_at_utc?: Date | null; distanceMeters?: number };
  const merged: Item[] = [
    ...evRows.map(r => ({ ...r, item_type: 'event', starts_at_utc: r.starts_at_utc })),
    ...ocRows.map(r => ({ ...r, item_type: 'occurrence', starts_at_utc: r.starts_at_utc })),
  ];

  let filtered = merged;
  if (lat && lng && radius) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseFloat(radius);
    filtered = merged
      .map((m) => {
        const la = m.latitude ? Number(m.latitude) : undefined;
        const lo = m.longitude ? Number(m.longitude) : undefined;
        if (la === undefined || lo === undefined) return null;
        const d = haversineMeters(latNum, lngNum, la, lo);
        return { ...m, distanceMeters: d };
      })
      .filter(Boolean) as Item[];
    filtered = filtered.filter((m) => (m.distanceMeters ?? Infinity) <= radiusNum);
  }

  filtered.sort((a, b) => {
    const ta = a.starts_at_utc ? new Date(a.starts_at_utc).getTime() : 0;
    const tb = b.starts_at_utc ? new Date(b.starts_at_utc).getTime() : 0;
    return ta - tb;
  });

  return c.json(toCamel(filtered));
});

// Public GET: conferences
api.get('/conferences', async (c) => {
  const db = await getDatabase(getDatabaseUrl());
  const now = new Date();
  const rows = await db.select().from(schema.conferences).where(and(eq(schema.conferences.status, 'approved'), gte(schema.conferences.ends_at_utc, now))).limit(200);
  return c.json(toCamel(rows));
});

api.get('/conferences/:id', async (c) => {
  const db = await getDatabase(getDatabaseUrl());
  const id = c.req.param('id');
  const [row] = await db.select().from(schema.conferences).where(eq(schema.conferences.id, id as any)).limit(1);
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(toCamel(row));
});

api.get('/conferences/:id/sessions', async (c) => {
  const db = await getDatabase(getDatabaseUrl());
  const id = c.req.param('id');
  const rows = await db.select().from(schema.conferenceSessions).where(eq(schema.conferenceSessions.conference_id, id as any)).limit(1000);
  return c.json(toCamel(rows));
});

// Submit (public): events pending
api.post('/events', async (c) => {
  const body = await c.req.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Invalid payload', details: parsed.error.flatten() }, 400);
  const db = await getDatabase(getDatabaseUrl());
  const v = parsed.data;
  const [row] = await db.insert(schema.events).values({
    name: v.name,
    event_type: v.eventType,
    committee: v.committee,
    committee_slug: v.committeeSlug,
    description: v.description,
    address: v.address,
    city: v.city,
    state_prov: v.stateProv,
    country: v.country,
    postal: v.postal,
    latitude: v.latitude as any,
    longitude: v.longitude as any,
    flyer_url: v.flyerUrl,
    website_url: v.websiteUrl,
    contact_email: v.contactEmail,
    contact_phone: v.contactPhone,
    status: 'pending',
    starts_at_utc: new Date(v.startsAtUtc),
    ends_at_utc: new Date(v.endsAtUtc),
  }).returning();
  return c.json(toCamel(row));
});

// Flags (public) with anti-abuse
api.post('/flags', async (c) => {
  const body = await c.req.json();
  const parsed = flagSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Invalid payload', details: parsed.error.flatten() }, 400);
  const v = parsed.data;
  // Honeypot: silently accept but no-op
  if (v.honeypot && v.honeypot.trim().length > 0) return c.json({ ok: true });
  const db = await getDatabase(getDatabaseUrl());
  const deviceId = v.deviceId || 'anonymous';
  const key = `flags:${deviceId}`;
  const now = new Date();
  const resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  // Simple upsert-based rate limit: max 3/day
  const existing = await db.select().from(schema.ratelimits).where(eq(schema.ratelimits.key, key)).limit(1);
  let count = existing[0]?.count ?? 0;
  let currentReset = existing[0]?.reset_at ?? resetAt;
  if (existing.length === 0 || new Date(currentReset) < now) {
    await db.insert(schema.ratelimits).values({ key, count: 1, reset_at: resetAt as any }).onConflictDoUpdate({ target: schema.ratelimits.key, set: { count: 1, reset_at: resetAt as any } });
  } else {
    if (count >= 3) return c.json({ error: 'Rate limit exceeded' }, 429);
    await db.insert(schema.ratelimits).values({ key, count: count + 1, reset_at: currentReset as any }).onConflictDoUpdate({ target: schema.ratelimits.key, set: { count: count + 1 } });
  }
  const user = await getUserOrNull(c);
  const [row] = await db.insert(schema.flags).values({
    target_type: v.targetType,
    target_id: v.targetId,
    committee_slug: v.committeeSlug,
    reason: v.reason,
    message: v.message,
    contact_email: v.contactEmail,
    status: 'open',
    created_at: now as any,
    created_by: user?.id,
    device_id: deviceId,
  }).returning();
  return c.json(toCamel(row));
});

// Admin/Mod (protected)
api.post('/series', requireUser, async (c) => {
  const body = await c.req.json();
  // For brevity, minimal validation; in production extend with zod
  const db = await getDatabase(getDatabaseUrl());
  const [row] = await db.insert(schema.series).values({ ...body, status: 'pending' }).returning();
  return c.json(toCamel(row));
});

api.post('/series/:id/generate', requireUser, async (c) => {
  const id = c.req.param('id');
  const monthsAhead = parseInt((c.req.query('months') || '6'));
  const { materializeForSeries } = await import('./jobs/materializeSeries');
  const db = await getDatabase(getDatabaseUrl());
  const [ser] = await db.select().from(schema.series).where(eq(schema.series.id, id as any)).limit(1);
  if (!ser) return c.json({ error: 'Not found' }, 404);
  const result = await materializeForSeries(ser, monthsAhead, db);
  return c.json({ ok: true, inserted: result.inserted, updated: result.updated });
});

// Simple approve/reject endpoints
api.patch('/events/:id/status', requireUser, async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  const db = await getDatabase(getDatabaseUrl());
  await db.update(schema.events).set({ status }).where(eq(schema.events.id, id as any));
  return c.json({ ok: true });
});

api.patch('/occurrences/:id/status', requireUser, async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  const db = await getDatabase(getDatabaseUrl());
  await db.update(schema.occurrences).set({ status }).where(eq(schema.occurrences.id, id as any));
  return c.json({ ok: true });
});

api.patch('/sessions/:id/status', requireUser, async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  const db = await getDatabase(getDatabaseUrl());
  await db.update(schema.conferenceSessions).set({ status }).where(eq(schema.conferenceSessions.id, id as any));
  return c.json({ ok: true });
});

// Dev route to run materializer
api.post('/dev/run-materializer', async (c) => {
  const monthsAhead = parseInt((await c.req.json()?.months) || '6');
  const { materializeRollingWindow } = await import('./jobs/materializeSeries');
  const res = await materializeRollingWindow(monthsAhead);
  return c.json({ ok: true, ...res });
});

// Protected routes - require authentication
const protectedRoutes = new Hono();

protectedRoutes.use('*', authMiddleware);

protectedRoutes.get('/me', (c) => {
  const user = c.get('user');
  return c.json({
    user,
    message: 'You are authenticated!',
  });
});

// Mount the protected routes under /protected
api.route('/protected', protectedRoutes);

// Mount the API router
app.route('/api/v1', api);

export default app; 