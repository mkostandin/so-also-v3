import { getDatabase } from '../lib/db';
import { getDatabaseUrl } from '../lib/env';
import * as schema from '../schema';

interface TestEvent {
  name: string;
  type: 'event' | 'conference';
  eventType?: 'Event' | 'Committee Meeting' | 'Conference' | 'YPAA Meeting' | 'Other';
  committee?: string;
  committeeSlug?: string;
  description?: string;
  city: string;
  stateProv: string;
  country: string;
  latitude: number;
  longitude: number;
  address?: string;
  startsAtUtc: Date;
  endsAtUtc: Date;
  flyerUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
}

async function seedTestData() {
  console.log('🌱 Starting test data seeding...');

  const db = await getDatabase(getDatabaseUrl());

  // Generate dates within the next 90 days
  const now = new Date();
  const baseDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Start 1 week from now

  const testEvents: TestEvent[] = [
    // NECYPAA Committee Meeting - Providence, RI
    {
      name: 'NECYPAA Committee Meeting',
      type: 'event',
      eventType: 'Committee Meeting',
      committee: 'NECYPAA',
      committeeSlug: 'necypaa',
      description: 'Monthly committee meeting to discuss NECYPAA initiatives and planning',
      city: 'Providence',
      stateProv: 'RI',
      country: 'USA',
      latitude: 41.8240 + (Math.random() - 0.5) * 0.02, // Small random offset
      longitude: -71.4128 + (Math.random() - 0.5) * 0.02,
      address: 'Providence Convention Center',
      startsAtUtc: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from base
      endsAtUtc: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      contactEmail: 'necypaa@necypaa.org',
    },

    // NECYPAA 35 Conference - Portland, ME
    {
      name: 'NECYPAA 35',
      type: 'event',
      eventType: 'Conference',
      committee: 'NECYPAA',
      committeeSlug: 'necypaa',
      description: '35th Annual NECYPAA Conference featuring keynote speakers and networking events',
      city: 'Portland',
      stateProv: 'ME',
      country: 'USA',
      latitude: 43.6591 + (Math.random() - 0.5) * 0.02,
      longitude: -70.2568 + (Math.random() - 0.5) * 0.02,
      address: 'Portland Convention Center',
      startsAtUtc: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 16 * 24 * 60 * 60 * 1000), // 3 days later
      flyerUrl: 'https://necypaa.org/necypaa35',
      websiteUrl: 'https://necypaa.org',
      contactEmail: 'necypaa@necypaa.org',
    },

    // MSCYPAA 26 Conference - Boston, MA
    {
      name: 'MSCYPAA 26',
      type: 'event',
      eventType: 'Conference',
      committee: 'MSCYPAA',
      committeeSlug: 'mscypaa',
      description: '26th Annual MSCYPAA Conference with workshops and professional development sessions',
      city: 'Boston',
      stateProv: 'MA',
      country: 'USA',
      latitude: 42.3601 + (Math.random() - 0.5) * 0.02,
      longitude: -71.0589 + (Math.random() - 0.5) * 0.02,
      address: 'Boston Marriott Copley Place',
      startsAtUtc: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 4 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 32 * 24 * 60 * 60 * 1000), // 3 days later
      flyerUrl: 'https://mscypaa.org/mscypaa26',
      websiteUrl: 'https://mscypaa.org',
      contactEmail: 'mscypaa@mscypaa.org',
    },

    // NECYPAA Fall Festival - Burlington, VT
    {
      name: 'NECYPAA Fall Festival',
      type: 'event',
      eventType: 'Event',
      committee: 'NECYPAA',
      committeeSlug: 'necypaa',
      description: 'Annual fall festival with games, food, and family activities',
      city: 'Burlington',
      stateProv: 'VT',
      country: 'USA',
      latitude: 44.4759 + (Math.random() - 0.5) * 0.02,
      longitude: -73.2121 + (Math.random() - 0.5) * 0.02,
      address: 'Burlington Waterfront Park',
      startsAtUtc: new Date(baseDate.getTime() + 45 * 24 * 60 * 60 * 1000), // 6.5 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 45 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 hours later
      contactEmail: 'events@necypaa.org',
    },

    // RYAA Spring Dance - Hartford, CT
    {
      name: 'RYAA Spring Dance',
      type: 'event',
      eventType: 'YPAA Meeting',
      committee: 'RYAA',
      committeeSlug: 'ryaa',
      description: 'Spring dance event for young alumni featuring live music and dancing',
      city: 'Hartford',
      stateProv: 'CT',
      country: 'USA',
      latitude: 41.7658 + (Math.random() - 0.5) * 0.02,
      longitude: -72.6734 + (Math.random() - 0.5) * 0.02,
      address: 'Hartford Ballroom',
      startsAtUtc: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000), // 8.5 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
      contactEmail: 'dance@ryaa.org',
    },

    // CSCYPAA Committee Meeting - Worcester, MA
    {
      name: 'CSCYPAA Committee Meeting',
      type: 'event',
      eventType: 'Committee Meeting',
      committee: 'CSCYPAA',
      committeeSlug: 'cscypaa',
      description: 'Quarterly committee meeting for CSCYPAA planning and coordination',
      city: 'Worcester',
      stateProv: 'MA',
      country: 'USA',
      latitude: 42.2626 + (Math.random() - 0.5) * 0.02,
      longitude: -71.8023 + (Math.random() - 0.5) * 0.02,
      address: 'Worcester Community Center',
      startsAtUtc: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from base
      endsAtUtc: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      contactEmail: 'committee@cscypaa.org',
    },

    // Maine YPAA Workshop - Augusta, ME
    {
      name: 'Maine YPAA Workshop',
      type: 'event',
      eventType: 'Other',
      committee: 'Maine YPAA',
      committeeSlug: 'maine-ypaa',
      description: 'Leadership development workshop for YPAA members in Maine',
      city: 'Augusta',
      stateProv: 'ME',
      country: 'USA',
      latitude: 44.3106 + (Math.random() - 0.5) * 0.02,
      longitude: -69.7795 + (Math.random() - 0.5) * 0.02,
      address: 'Augusta State House Conference Room',
      startsAtUtc: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 hours later
      contactEmail: 'workshops@maine-ypaa.org',
    },

    // Vermont YPAA Dance - Montpelier, VT
    {
      name: 'Vermont YPAA Dance',
      type: 'event',
      eventType: 'YPAA Meeting',
      committee: 'Vermont YPAA',
      committeeSlug: 'vt-ypaa',
      description: 'Evening dance social for Vermont YPAA members',
      city: 'Montpelier',
      stateProv: 'VT',
      country: 'USA',
      latitude: 44.2601 + (Math.random() - 0.5) * 0.02,
      longitude: -72.5754 + (Math.random() - 0.5) * 0.02,
      address: 'Montpelier Community Center',
      startsAtUtc: new Date(baseDate.getTime() + 35 * 24 * 60 * 60 * 1000), // 5 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 35 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 5 hours later
      contactEmail: 'social@vt-ypaa.org',
    },

    // Rhode Island YPAA Meeting - Warwick, RI
    {
      name: 'Rhode Island YPAA Meeting',
      type: 'event',
      eventType: 'YPAA Meeting',
      committee: 'Rhode Island YPAA',
      committeeSlug: 'ri-ypaa',
      description: 'Monthly membership meeting for Rhode Island YPAA',
      city: 'Warwick',
      stateProv: 'RI',
      country: 'USA',
      latitude: 41.7001 + (Math.random() - 0.5) * 0.02,
      longitude: -71.4162 + (Math.random() - 0.5) * 0.02,
      address: 'Warwick Public Library',
      startsAtUtc: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from base
      endsAtUtc: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      contactEmail: 'meetings@ri-ypaa.org',
    },
  ];

  console.log(`📅 Seeding ${testEvents.length} test events...`);

  let eventsInserted = 0;

  for (const event of testEvents) {
    try {
      await db.insert(schema.events).values({
        name: event.name,
        event_type: event.eventType!,
        committee: event.committee,
        committee_slug: event.committeeSlug,
        description: event.description,
        address: event.address,
        city: event.city,
        state_prov: event.stateProv,
        country: event.country,
        latitude: event.latitude,
        longitude: event.longitude,
        flyer_url: event.flyerUrl,
        website_url: event.websiteUrl,
        contact_email: event.contactEmail,
        status: 'approved',
        starts_at_utc: event.startsAtUtc,
        ends_at_utc: event.endsAtUtc,
      });
      eventsInserted++;
      console.log(`✅ Inserted event: ${event.name}`);
    } catch (error) {
      console.error(`❌ Failed to insert ${event.name}:`, error);
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`📊 Events inserted: ${eventsInserted}`);
  console.log(`📊 Total: ${eventsInserted} records`);

  console.log('\n📍 Test data locations:');
  testEvents.forEach(event => {
    console.log(`   ${event.name} - ${event.city}, ${event.stateProv}`);
  });

  console.log('\n🗺️  Visit your map at /map to see the events!');
  console.log('🧹 To clean up test data, you can manually delete records with status=\'approved\' that match these event names.');

  process.exit(0);
}

// Run the seeder
seedTestData().catch((error) => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});
