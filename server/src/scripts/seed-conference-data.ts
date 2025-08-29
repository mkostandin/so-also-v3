import { getDatabase } from '../lib/db';
import { getDatabaseUrl } from '../lib/env';
import * as schema from '../schema';

interface ConferenceData {
  name: string;
  city: string;
  stateProv: string;
  country: string;
  latitude: number;
  longitude: number;
  programUrl?: string;
  hotelMapUrl?: string;
  flyerUrl?: string;
  websiteUrl?: string;
  imageUrls?: string[];
  startsAtUtc: Date;
  endsAtUtc: Date;
  description?: string;
}

interface ConferenceSessionData {
  title: string;
  type: 'workshop' | 'panel' | 'main' | 'marathon' | 'dance' | 'event' | 'main_meeting';
  room?: string;
  desc?: string;
  startsAtUtc: Date;
  endsAtUtc: Date;
}

async function seedConferenceData() {
  console.log('🏛️ Starting comprehensive conference test data seeding...');

  const db = await getDatabase(getDatabaseUrl());

  // Generate dates for the next 6 months
  const now = new Date();
  const baseDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Start 30 days from now

  const conferences: ConferenceData[] = [
    // Northeast Regional Conferences
    {
      name: 'NECYPAA 36th Annual Conference',
      city: 'Portland',
      stateProv: 'ME',
      country: 'USA',
      latitude: 43.6591,
      longitude: -70.2568,
      programUrl: 'https://necypaa.org/conferences/necypaa36/program',
      hotelMapUrl: 'https://necypaa.org/conferences/necypaa36/hotels',
      flyerUrl: 'https://necypaa.org/conferences/necypaa36/flyer.pdf',
      websiteUrl: 'https://necypaa.org/conferences/necypaa36',
      imageUrls: [
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
      ],
      startsAtUtc: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 17 * 24 * 60 * 60 * 1000), // 4 days later
      description: 'The 36th Annual NECYPAA Conference brings together alumni from across New England for three days of networking, professional development, and celebration of our shared heritage.'
    },

    {
      name: 'MSCYPAA 27th Annual Leadership Summit',
      city: 'Boston',
      stateProv: 'MA',
      country: 'USA',
      latitude: 42.3601,
      longitude: -71.0589,
      programUrl: 'https://mscypaa.org/conferences/mscypaa27/program',
      hotelMapUrl: 'https://mscypaa.org/conferences/mscypaa27/hotels',
      flyerUrl: 'https://mscypaa.org/conferences/mscypaa27/flyer.pdf',
      websiteUrl: 'https://mscypaa.org/conferences/mscypaa27',
      imageUrls: [
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800'
      ],
      startsAtUtc: new Date(baseDate.getTime() + 45 * 24 * 60 * 60 * 1000), // 6.5 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 48 * 24 * 60 * 60 * 1000), // 4 days later
      description: 'MSCYPAA\'s premier leadership development conference featuring workshops, keynote speakers, and networking opportunities for young alumni in Massachusetts.'
    },

    {
      name: 'CSCYPAA 22nd Annual Spring Conference',
      city: 'Hartford',
      stateProv: 'CT',
      country: 'USA',
      latitude: 41.7658,
      longitude: -72.6734,
      programUrl: 'https://cscypaa.org/conferences/cscypaa22/program',
      hotelMapUrl: 'https://cscypaa.org/conferences/cscypaa22/hotels',
      flyerUrl: 'https://cscypaa.org/conferences/cscypaa22/flyer.pdf',
      websiteUrl: 'https://cscypaa.org/conferences/cscypaa22',
      imageUrls: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800'
      ],
      startsAtUtc: new Date(baseDate.getTime() + 75 * 24 * 60 * 60 * 1000), // 10.5 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 77 * 24 * 60 * 60 * 1000), // 3 days later
      description: 'Connecticut\'s premier YPAA gathering featuring professional development, cultural celebrations, and community building activities.'
    },

    // Mid-Atlantic Regional Conferences
    {
      name: 'NYCYPAA 31st Annual Gala Conference',
      city: 'New York',
      stateProv: 'NY',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.0060,
      programUrl: 'https://nycypaa.org/conferences/nycypaa31/program',
      hotelMapUrl: 'https://nycypaa.org/conferences/nycypaa31/hotels',
      flyerUrl: 'https://nycypaa.org/conferences/nycypaa31/flyer.pdf',
      websiteUrl: 'https://nycypaa.org/conferences/nycypaa31',
      imageUrls: [
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800'
      ],
      startsAtUtc: new Date(baseDate.getTime() + 90 * 24 * 60 * 60 * 1000), // 13 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 93 * 24 * 60 * 60 * 1000), // 4 days later
      description: 'New York City\'s most anticipated YPAA event featuring gala dinners, professional networking, and cultural celebrations in the heart of Manhattan.'
    },

    {
      name: 'PACYPAA 18th Annual Regional Conference',
      city: 'Philadelphia',
      stateProv: 'PA',
      country: 'USA',
      latitude: 39.9526,
      longitude: -75.1652,
      programUrl: 'https://pacypaa.org/conferences/pacypaa18/program',
      hotelMapUrl: 'https://pacypaa.org/conferences/pacypaa18/hotels',
      flyerUrl: 'https://pacypaa.org/conferences/pacypaa18/flyer.pdf',
      websiteUrl: 'https://pacypaa.org/conferences/pacypaa18',
      imageUrls: [
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
      ],
      startsAtUtc: new Date(baseDate.getTime() + 120 * 24 * 60 * 60 * 1000), // 17 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 122 * 24 * 60 * 60 * 1000), // 3 days later
      description: 'Pennsylvania\'s regional YPAA conference focusing on leadership development, mentorship, and community service initiatives.'
    },

    // Southern Regional Conferences
    {
      name: 'VAYPAA 15th Annual Conference',
      city: 'Richmond',
      stateProv: 'VA',
      country: 'USA',
      latitude: 37.5407,
      longitude: -77.4360,
      programUrl: 'https://vaypaa.org/conferences/vaypaa15/program',
      hotelMapUrl: 'https://vaypaa.org/conferences/vaypaa15/hotels',
      flyerUrl: 'https://vaypaa.org/conferences/vaypaa15/flyer.pdf',
      websiteUrl: 'https://vaypaa.org/conferences/vaypaa15',
      imageUrls: [
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'
      ],
      startsAtUtc: new Date(baseDate.getTime() + 150 * 24 * 60 * 60 * 1000), // 21.5 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 153 * 24 * 60 * 60 * 1000), // 4 days later
      description: 'Virginia\'s premier YPAA gathering celebrating our heritage while building tomorrow\'s leaders through workshops and networking.'
    },

    {
      name: 'NCYPAA 28th Annual Spring Conference',
      city: 'Charlotte',
      stateProv: 'NC',
      country: 'USA',
      latitude: 35.2271,
      longitude: -80.8431,
      programUrl: 'https://ncypaa.org/conferences/ncypaa28/program',
      hotelMapUrl: 'https://ncypaa.org/conferences/ncypaa28/hotels',
      flyerUrl: 'https://ncypaa.org/conferences/ncypaa28/flyer.pdf',
      websiteUrl: 'https://ncypaa.org/conferences/ncypaa28',
      imageUrls: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'
      ],
      startsAtUtc: new Date(baseDate.getTime() + 180 * 24 * 60 * 60 * 1000), // 26 weeks from base
      endsAtUtc: new Date(baseDate.getTime() + 182 * 24 * 60 * 60 * 1000), // 3 days later
      description: 'North Carolina\'s largest YPAA conference featuring diverse programming, cultural celebrations, and professional development opportunities.'
    },
  ];

  console.log(`🏛️ Seeding ${conferences.length} conferences...`);

  let conferencesInserted = 0;
  let sessionsInserted = 0;

  for (const conference of conferences) {
    try {
      // Insert conference
      const [insertedConference] = await db.insert(schema.conferences).values({
        name: conference.name,
        city: conference.city,
        program_url: conference.programUrl,
        hotel_map_url: conference.hotelMapUrl,
        flyer_url: conference.flyerUrl,
        website_url: conference.websiteUrl,
        image_urls: conference.imageUrls,
        starts_at_utc: conference.startsAtUtc,
        ends_at_utc: conference.endsAtUtc,
        status: 'approved',
      }).returning();

      conferencesInserted++;
      console.log(`✅ Inserted conference: ${conference.name}`);

      // Generate conference sessions for this conference
      const conferenceSessions = generateConferenceSessions(insertedConference.id, conference.startsAtUtc, conference.endsAtUtc);

      for (const session of conferenceSessions) {
        try {
          await db.insert(schema.conferenceSessions).values({
            conference_id: insertedConference.id,
            title: session.title,
            type: session.type,
            room: session.room,
            desc: session.desc,
            starts_at_utc: session.startsAtUtc,
            ends_at_utc: session.endsAtUtc,
            status: 'approved',
          });
          sessionsInserted++;
        } catch (error) {
          console.error(`❌ Failed to insert session "${session.title}":`, error);
        }
      }

    } catch (error) {
      console.error(`❌ Failed to insert conference ${conference.name}:`, error);
    }
  }

  console.log(`\n🎉 Conference seeding complete!`);
  console.log(`📊 Conferences inserted: ${conferencesInserted}`);
  console.log(`📊 Sessions inserted: ${sessionsInserted}`);
  console.log(`📊 Total records: ${conferencesInserted + sessionsInserted}`);

  console.log('\n📍 Conference locations:');
  conferences.forEach(conf => {
    console.log(`   ${conf.name} - ${conf.city}, ${conf.stateProv}`);
  });

  console.log('\n🗺️  Visit your map at /map to see the conferences!');
  console.log('📋 Check /api/v1/conferences to see the API response');
  console.log('🧹 To clean up test data, you can manually delete records with status=\'approved\' from conferences and conference_sessions tables.');

  process.exit(0);
}

function generateConferenceSessions(conferenceId: string, conferenceStart: Date, conferenceEnd: Date): ConferenceSessionData[] {
  const sessions: ConferenceSessionData[] = [];

  // Conference spans multiple days
  const days = Math.ceil((conferenceEnd.getTime() - conferenceStart.getTime()) / (24 * 60 * 60 * 1000));

  for (let day = 0; day < days; day++) {
    const dayStart = new Date(conferenceStart.getTime() + day * 24 * 60 * 60 * 1000);
    const dayStartHour = 8; // Start at 8 AM
    const dayEndHour = 18; // End at 6 PM

    // Main opening session on first day
    if (day === 0) {
      sessions.push({
        title: 'Opening Ceremony & Welcome',
        type: 'main',
        room: 'Grand Ballroom',
        desc: 'Official opening of the conference with welcoming remarks from leadership and special guests.',
        startsAtUtc: new Date(dayStart.getTime() + dayStartHour * 60 * 60 * 1000),
        endsAtUtc: new Date(dayStart.getTime() + (dayStartHour + 1.5) * 60 * 60 * 1000), // 1.5 hours
      });

      // Keynote session
      sessions.push({
        title: 'Keynote Address: Leadership in the Modern Era',
        type: 'main',
        room: 'Grand Ballroom',
        desc: 'Inspiring keynote on leadership development and community impact in today\'s world.',
        startsAtUtc: new Date(dayStart.getTime() + (dayStartHour + 2) * 60 * 60 * 1000),
        endsAtUtc: new Date(dayStart.getTime() + (dayStartHour + 3.5) * 60 * 60 * 1000), // 1.5 hours
      });
    }

    // Morning workshops (2 sessions, 1.5 hours each)
    const morningWorkshops = [
      {
        title: 'Professional Development Workshop: Career Advancement Strategies',
        desc: 'Interactive workshop on career planning, networking, and professional growth opportunities.',
        room: 'Conference Room A'
      },
      {
        title: 'Community Leadership & Mentorship Program',
        desc: 'Learn about effective mentorship strategies and community leadership roles.',
        room: 'Conference Room B'
      },
      {
        title: 'Financial Planning for Young Professionals',
        desc: 'Essential financial planning skills including budgeting, investing, and debt management.',
        room: 'Conference Room C'
      },
      {
        title: 'Digital Marketing & Personal Branding',
        desc: 'Building your personal brand in the digital age and effective online networking.',
        room: 'Conference Room D'
      }
    ];

    // Add morning workshops
    for (let i = 0; i < 2; i++) {
      const workshop = morningWorkshops[Math.floor(Math.random() * morningWorkshops.length)];
      sessions.push({
        title: workshop.title,
        type: 'workshop',
        room: workshop.room,
        desc: workshop.desc,
        startsAtUtc: new Date(dayStart.getTime() + (dayStartHour + 4 + i * 2) * 60 * 60 * 1000),
        endsAtUtc: new Date(dayStart.getTime() + (dayStartHour + 5.5 + i * 2) * 60 * 60 * 1000), // 1.5 hours
      });
    }

    // Lunch break and networking
    sessions.push({
      title: 'Networking Luncheon',
      type: 'event',
      room: 'Dining Hall',
      desc: 'Casual networking opportunity during lunch with light refreshments.',
      startsAtUtc: new Date(dayStart.getTime() + 12 * 60 * 60 * 1000), // 12 PM
      endsAtUtc: new Date(dayStart.getTime() + 13.5 * 60 * 60 * 1000), // 1.5 hours
    });

    // Afternoon panel discussions
    const panels = [
      {
        title: 'Panel: Entrepreneurship & Innovation in Our Community',
        desc: 'Discussion with successful entrepreneurs about starting businesses and innovation.',
        room: 'Grand Ballroom'
      },
      {
        title: 'Panel: Education & Scholarship Opportunities',
        desc: 'Panel discussion on educational advancement and scholarship programs available.',
        room: 'Conference Room A'
      },
      {
        title: 'Panel: Community Service & Social Impact',
        desc: 'Exploring ways to make meaningful contributions to our communities.',
        room: 'Conference Room B'
      }
    ];

    // Add afternoon panels
    for (let i = 0; i < Math.min(2, panels.length); i++) {
      const panel = panels[i];
      sessions.push({
        title: panel.title,
        type: 'panel',
        room: panel.room,
        desc: panel.desc,
        startsAtUtc: new Date(dayStart.getTime() + (14 + i * 2) * 60 * 60 * 1000), // 2 PM, 4 PM
        endsAtUtc: new Date(dayStart.getTime() + (15.5 + i * 2) * 60 * 60 * 1000), // 1.5 hours each
      });
    }

    // Evening social event on last day
    if (day === days - 1) {
      sessions.push({
        title: 'Gala Dinner & Awards Ceremony',
        type: 'main_meeting',
        room: 'Grand Ballroom',
        desc: 'Formal dinner celebration with awards presentation and closing remarks.',
        startsAtUtc: new Date(dayStart.getTime() + 18 * 60 * 60 * 1000), // 6 PM
        endsAtUtc: new Date(dayStart.getTime() + 22 * 60 * 60 * 1000), // 4 hours
      });

      // Optional dance session
      if (Math.random() > 0.5) {
        sessions.push({
          title: 'Evening Dance & Social',
          type: 'dance',
          room: 'Ballroom Lounge',
          desc: 'Optional evening dance and social gathering for attendees.',
          startsAtUtc: new Date(dayStart.getTime() + 20 * 60 * 60 * 1000), // 8 PM
          endsAtUtc: new Date(dayStart.getTime() + 23 * 60 * 60 * 1000), // 3 hours
        });
      }
    }

    // Add a marathon session on middle days
    if (day > 0 && day < days - 1 && Math.random() > 0.6) {
      sessions.push({
        title: 'All-Day Professional Development Marathon',
        type: 'marathon',
        room: 'Conference Room A',
        desc: 'Full-day intensive workshop series covering multiple professional development topics.',
        startsAtUtc: new Date(dayStart.getTime() + dayStartHour * 60 * 60 * 1000),
        endsAtUtc: new Date(dayStart.getTime() + dayEndHour * 60 * 60 * 1000), // All day
      });
    }
  }

  return sessions;
}

// Run the seeder
seedConferenceData().catch((error) => {
  console.error('💥 Conference seeding failed:', error);
  process.exit(1);
});
