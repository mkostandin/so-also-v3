import { getDatabase } from '../lib/db';
import { getDatabaseUrl } from '../lib/env';
import * as schema from '../schema';

// Valid committee patterns
const REGIONAL_COMMITTEES = [
  'NECYPAA',
  'MSCYPAA',
  'RISCYPAA',
  'NHSCYPAA',
  'CSCYPAA',
  'VTCYPAA',
  'MECYPAA'
];

const ADVISORY_COMMITTEES = [
  'NECYPAA ADVISORY',
  'MSCYPAA ADVISORY',
  'RISCYPAA ADVISORY',
  'NHSCYPAA ADVISORY'
];

const BID_COMMITTEES = [
  'RHODE ISLAND BID FOR NECYPAA',
  'MASSACHUSETTS BID FOR MSCYPAA',
  'CONNECTICUT BID FOR CSCYPAA',
  'NEW HAMPSHIRE BID FOR NHSCYPAA',
  'VERMONT BID FOR VTCYPAA',
  'MAINE BID FOR MECYPAA'
];

const ALL_COMMITTEES = [...REGIONAL_COMMITTEES, ...ADVISORY_COMMITTEES, ...BID_COMMITTEES];

// Event types
const EVENT_TYPES = ['Event', 'Committee Meeting', 'Conference', 'YPAA Meeting'];

// Cities and their approximate coordinates
const LOCATIONS = [
  { city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
  { city: 'Providence', state: 'RI', lat: 41.8240, lng: -71.4128 },
  { city: 'Hartford', state: 'CT', lat: 41.7658, lng: -72.6734 },
  { city: 'Manchester', state: 'NH', lat: 42.9956, lng: -71.4548 },
  { city: 'Burlington', state: 'VT', lat: 44.4759, lng: -73.2121 },
  { city: 'Portland', state: 'ME', lat: 43.6591, lng: -70.2568 },
  { city: 'Springfield', state: 'MA', lat: 42.1015, lng: -72.5898 },
  { city: 'Worcester', state: 'MA', lat: 42.2626, lng: -71.8023 },
  { city: 'New Haven', state: 'CT', lat: 41.3083, lng: -72.9279 },
  { city: 'Concord', state: 'NH', lat: 43.2081, lng: -71.5376 },
  { city: 'Montpelier', state: 'VT', lat: 44.2601, lng: -72.5754 },
  { city: 'Augusta', state: 'ME', lat: 44.3106, lng: -69.7795 },
  { city: 'Derry', state: 'NH', lat: 42.8806, lng: -71.3290 }, // Default fallback location
];

// Generate slug from committee name
function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Generate random date within next 90 days
function getRandomFutureDate(): Date {
  const now = new Date();
  const daysAhead = Math.floor(Math.random() * 90) + 1;
  const randomDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  // Set random hour between 9 AM and 8 PM
  randomDate.setHours(9 + Math.floor(Math.random() * 11), Math.floor(Math.random() * 60), 0, 0);
  return randomDate;
}

// Generate random duration (1-8 hours)
function getRandomDuration(): number {
  return (1 + Math.floor(Math.random() * 8)) * 60 * 60 * 1000; // in milliseconds
}

// Generate event name based on committee and type
function generateEventName(committee: string, eventType: string, index: number): string {
  const prefixes = {
    'Event': ['Annual', 'Spring', 'Fall', 'Winter', 'Summer', 'Regional'],
    'Committee Meeting': ['Monthly', 'Quarterly', 'Special', 'Planning', 'Strategy'],
    'Conference': ['Annual', 'Regional', 'Statewide', 'Northeast', 'New England'],
    'YPAA Meeting': ['Weekly', 'Monthly', 'Special', 'General', 'Planning']
  };

  const themes = [
    'Meeting', 'Workshop', 'Seminar', 'Retreat', 'Conference', 'Gathering',
    'Summit', 'Forum', 'Assembly', 'Convention', 'Symposium', 'Colloquium'
  ];

  const prefix = prefixes[eventType as keyof typeof prefixes][index % prefixes[eventType as keyof typeof prefixes].length];
  const theme = themes[index % themes.length];

  if (eventType === 'YPAA Meeting') {
    return `${committee} ${prefix} ${theme}`;
  }

  return `${prefix} ${committee} ${theme}`;
}

// Generate address based on location
function generateAddress(location: typeof LOCATIONS[0]): string {
  const streets = ['Main St', 'Elm St', 'Oak St', 'Maple Ave', 'Pine St', 'Cedar Ln', 'Birch Rd'];
  const numbers = Math.floor(Math.random() * 999) + 1;
  return `${numbers} ${streets[Math.floor(Math.random() * streets.length)]}`;
}

async function seedCommitteeData() {
  console.log('🌱 Starting committee data seeding...');

  const db = await getDatabase(getDatabaseUrl());

  try {
    // First, insert all committees
    console.log('📝 Inserting committees...');
    for (const committeeName of ALL_COMMITTEES) {
      const slug = generateSlug(committeeName);
      await db.insert(schema.committees).values({
        name: committeeName,
        slug: slug,
        test_data: true,
        last_seen: new Date(),
      }).onConflictDoNothing();
    }
    console.log(`✅ Inserted ${ALL_COMMITTEES.length} committees`);

    // Generate ~100 events
    console.log('📅 Generating events...');
    const eventsToInsert = [];

    for (let i = 0; i < 100; i++) {
      const committee = ALL_COMMITTEES[Math.floor(Math.random() * ALL_COMMITTEES.length)];
      const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

      const startDate = getRandomFutureDate();
      const duration = getRandomDuration();
      const endDate = new Date(startDate.getTime() + duration);

      const eventName = generateEventName(committee, eventType, i);
      const address = generateAddress(location);

      eventsToInsert.push({
        name: eventName,
        event_type: eventType as any,
        committee: committee,
        committee_slug: generateSlug(committee),
        description: `${eventType} organized by ${committee} featuring discussions and networking opportunities.`,
        address: address,
        city: location.city,
        state_prov: location.state,
        country: 'USA',
        postal: `${Math.floor(Math.random() * 90000) + 10000}`,
        latitude: location.lat + (Math.random() - 0.5) * 0.1, // Add some variation
        longitude: location.lng + (Math.random() - 0.5) * 0.1,
        flyer_url: null,
        website_url: `https://example.com/events/${generateSlug(eventName)}`,
        contact_email: `info@${generateSlug(committee)}.org`,
        contact_phone: `(${Math.floor(Math.random() * 900) + 100})-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        image_urls: [],
        status: 'approved' as const,
        test_data: true,
        starts_at_utc: startDate,
        ends_at_utc: endDate,
      });
    }

    // Insert events in batches
    const batchSize = 10;
    for (let i = 0; i < eventsToInsert.length; i += batchSize) {
      const batch = eventsToInsert.slice(i, i + batchSize);
      await db.insert(schema.events).values(batch);
      console.log(`✅ Inserted events ${i + 1}-${Math.min(i + batchSize, eventsToInsert.length)}`);
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`📊 Committees: ${ALL_COMMITTEES.length}`);
    console.log(`📅 Events: ${eventsToInsert.length}`);

    // Verify the data
    const committeeCount = await db.select({ count: schema.sql`count(*)` }).from(schema.committees);
    const eventCount = await db.select({ count: schema.sql`count(*)` }).from(schema.events);

    console.log(`\n🔍 Verification:`);
    console.log(`   Committees in DB: ${committeeCount[0].count}`);
    console.log(`   Events in DB: ${eventCount[0].count}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the seeding
seedCommitteeData().catch((error) => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});



