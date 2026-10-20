import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Family', slug: 'family', count: '772', icon: 'https://images.lumacdn.com/uploads/aq/f5fbdde4-46a9-4d9e-b730-7144b3c0e335.png' },
  { name: 'Books', slug: 'books', count: '767', icon: 'https://images.lumacdn.com/uploads/3g/f33c0b3c-9090-40bb-b99c-875b534bcee4.png' },
  { name: 'Games', slug: 'games', count: '554', icon: 'https://images.lumacdn.com/uploads/mp/c65f64de-a537-4867-b7e6-7eedd3470c82.png' },
  { name: 'Tech', slug: 'tech', count: '4,198', icon: 'https://images.lumacdn.com/uploads/v7/3f6baafa-d90d-4013-9853-0fa10331f796.png' },
  { name: 'Food & Drink', slug: 'food', count: '579', icon: 'https://images.lumacdn.com/uploads/36/a77db635-cb3b-4720-9758-2bc9dae948e4.png' },
  { name: 'AI', slug: 'ai', count: '3,915', icon: 'https://images.lumacdn.com/uploads/0z/c1143c0e-a2ab-4434-b82b-80b0ba3ec2f0.png' },
  { name: 'Running', slug: 'running', count: '636', icon: 'https://images.lumacdn.com/uploads/9f/9a31599b-38be-49c8-9c46-dfa19becb9ad.png' },
  { name: 'Arts & Culture', slug: 'arts', count: '3,620', icon: 'https://images.lumacdn.com/uploads/u8/5eeba5a4-d305-4bc1-9017-329937813f30.png' },
  { name: 'Climate', slug: 'climate', count: '1,029', icon: 'https://images.lumacdn.com/uploads/on/19946552-9254-41de-b105-d086a2e4ac68.png' },
  { name: 'Fitness', slug: 'fitness', count: '1,773', icon: 'https://images.lumacdn.com/uploads/7b/f3930d36-b2f2-4df3-8db6-798df9b0897f.png' },
  { name: 'Wellness', slug: 'wellness', count: '1,064', icon: 'https://images.lumacdn.com/uploads/y5/4f225f49-0c10-4bba-b1cb-77ae216268ac.png' },
  { name: 'Crypto', slug: 'crypto', count: '559', icon: 'https://images.lumacdn.com/uploads/yl/096bc517-f9fc-49fe-befd-401e29cc4662.png' },
];

const PLACES_BY_CONTINENT: Record<
  string,
  { name: string; slug: string; count: number; icon: string; tint: string }[]
> = {
  'North America': [
    { name: 'New York', slug: 'nyc', count: 95, icon: 'https://images.lumacdn.com/discovery/nyc-icon.png', tint: '#e08d55' },
    { name: 'San Francisco', slug: 'sf', count: 58, icon: 'https://images.lumacdn.com/discovery/sf-icon.png', tint: '#ff6519' },
    { name: 'Los Angeles', slug: 'la', count: 44, icon: 'https://images.lumacdn.com/discovery/la-icon.png', tint: '#538f21' },
    { name: 'Boston', slug: 'boston', count: 29, icon: 'https://images.lumacdn.com/discovery/boston-icon.png', tint: '#d77f30' },
    { name: 'Las Vegas', slug: 'las-vegas', count: 26, icon: 'https://images.lumacdn.com/discovery/vegas-icon.png', tint: '#e5ba47' },
    { name: 'Seattle', slug: 'seattle', count: 21, icon: 'https://images.lumacdn.com/discovery/seattle-icon.png', tint: '#9198e6' },
    { name: 'Philadelphia', slug: 'philadelphia', count: 21, icon: 'https://images.lumacdn.com/discovery/philly-icon.png', tint: '#e7963f' },
    { name: 'Miami', slug: 'miami', count: 20, icon: 'https://images.lumacdn.com/discovery/miami-icon.png', tint: '#408dae' },
    { name: 'Montréal', slug: 'montreal', count: 20, icon: 'https://images.lumacdn.com/discovery/montreal-icon.png', tint: '#387eb1' },
    { name: 'Washington, DC', slug: 'dc', count: 19, icon: 'https://images.lumacdn.com/discovery/dc-icon.png', tint: '#bbb0a6' },
    { name: 'Chicago', slug: 'chicago', count: 18, icon: 'https://images.lumacdn.com/discovery/chicago-icon.png', tint: '#e66c9f' },
    { name: 'Atlanta', slug: 'atlanta', count: 17, icon: 'https://images.lumacdn.com/discovery/atlanta-icon.png', tint: '#2f7ca9' },
    { name: 'Austin', slug: 'austin', count: 16, icon: 'https://images.lumacdn.com/discovery/austin-icon.png', tint: '#f5b938' },
    { name: 'Minneapolis', slug: 'minneapolis', count: 16, icon: 'https://images.lumacdn.com/discovery/minneapolis-icon.png', tint: '#ba365c' },
    { name: 'Dallas', slug: 'dallas', count: 15, icon: 'https://images.lumacdn.com/discovery/dallas-icon.png', tint: '#dbb58c' },
    { name: 'Toronto', slug: 'toronto', count: 14, icon: 'https://images.lumacdn.com/discovery/toronto-icon.png', tint: '#306ed1' },
    { name: 'Sacramento', slug: 'sacramento', count: 13, icon: 'https://images.lumacdn.com/discovery/sacramento-icon.png', tint: '#34d1a7' },
    { name: 'San Diego', slug: 'sd', count: 13, icon: 'https://images.lumacdn.com/discovery/sd-icon.png', tint: '#3ba4eb' },
    { name: 'Raleigh', slug: 'raleigh', count: 12, icon: 'https://images.lumacdn.com/discovery/raleigh-icon.png', tint: '#70bf2a' },
    { name: 'Salt Lake City', slug: 'salt-lake-city', count: 11, icon: 'https://images.lumacdn.com/discovery/slc-icon.png', tint: '#e2a533' },
    { name: 'Houston', slug: 'houston', count: 11, icon: 'https://images.lumacdn.com/discovery/houston-icon.png', tint: '#bc693b' },
    { name: 'Denver', slug: 'denver', count: 10, icon: 'https://images.lumacdn.com/discovery/denver-icon.png', tint: '#e98406' },
  ],
  'Europe': [
    { name: 'London', slug: 'london', count: 56, icon: 'https://images.lumacdn.com/discovery/london-icon.png', tint: '#e89800' },
    { name: 'Amsterdam', slug: 'amsterdam', count: 48, icon: 'https://images.lumacdn.com/discovery/ams-icon.png', tint: '#de475e' },
    { name: 'Paris', slug: 'paris', count: 23, icon: 'https://images.lumacdn.com/discovery/paris-icon.png', tint: '#ce8f5c' },
    { name: 'Lisbon', slug: 'lisbon', count: 19, icon: 'https://images.lumacdn.com/discovery/lisbon-icon.png', tint: '#df7440' },
    { name: 'Madrid', slug: 'madrid', count: 15, icon: 'https://images.lumacdn.com/discovery/madrid-icon.png', tint: '#c2bc4f' },
    { name: 'Dublin', slug: 'dublin', count: 12, icon: 'https://images.lumacdn.com/discovery/dublin-icon.png', tint: '#f5a55d' },
    { name: 'Berlin', slug: 'berlin', count: 24, icon: 'https://images.lumacdn.com/discovery/calgary-icon.png', tint: '#37b1b8' },
  ],
  'Asia & Pacific': [
    { name: 'Jakarta', slug: 'jakarta', count: 4, icon: 'https://images.lumacdn.com/discovery/dubai-icon.png', tint: '#2c022cff' },
    { name: 'Tokyo', slug: 'tokyo', count: 40, icon: 'https://images.lumacdn.com/discovery/tokyo-icon.png', tint: '#e69f93' },
    { name: 'Tel Aviv-Yafo', slug: 'tel-aviv', count: 22, icon: 'https://images.lumacdn.com/discovery/telaviv-icon.png', tint: '#f39050' },
    { name: 'Singapore', slug: 'singapore', count: 24, icon: 'https://images.lumacdn.com/discovery/miami-icon.png', tint: '#408dae' },
    { name: 'Dubai', slug: 'dubai', count: 14, icon: 'https://images.lumacdn.com/discovery/dubai-icon.png', tint: '#ab52ab' },
    { name: 'Seoul', slug: 'seoul', count: 11, icon: 'https://images.lumacdn.com/discovery/seoul-icon.png', tint: '#7fabeb' },
    { name: 'Osaka', slug: 'osaka', count: 7, icon: 'https://images.lumacdn.com/discovery/osaka-icon.png', tint: '#d072d4' },
  ],
  'South America': [
    { name: 'São Paulo', slug: 'saopaulo', count: 12, icon: 'https://images.lumacdn.com/discovery/sp-icon.png', tint: '#7f747a' },
    { name: 'Medellín', slug: 'medellin', count: 8, icon: 'https://images.lumacdn.com/discovery/medellin-icon.png', tint: '#4e98cf' },
    { name: 'Buenos Aires', slug: 'buenos-aires', count: 7, icon: 'https://images.lumacdn.com/discovery/ba-icon.png', tint: '#e57d6e' },
    { name: 'Bogotá', slug: 'bogota', count: 6, icon: 'https://images.lumacdn.com/discovery/bogota-icon.png', tint: '#d28a4f' },
  ],
  'Africa': [
    { name: 'Cape Town', slug: 'capetown', count: 14, icon: 'https://images.lumacdn.com/discovery/capetown-icon.png', tint: '#57c9c9' },
    { name: 'Lagos', slug: 'lagos', count: 13, icon: 'https://images.lumacdn.com/discovery/lagos-icon.png', tint: '#757366' },
    { name: 'Nairobi', slug: 'nairobi', count: 11, icon: 'https://images.lumacdn.com/discovery/nairobi-icon.png', tint: '#546d06' },
  ],
};

async function main() {
  console.log('Seeding Helio database with discover categories, places, calendars & events...');

  // Clean existing data
  await prisma.registration.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.merchandise.deleteMany();
  await prisma.event.deleteMany();
  await prisma.calendar.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.city.deleteMany();

  // 1. Seed Categories Table
  for (const cat of CATEGORIES) {
    await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        count: cat.count,
        icon: cat.icon,
      },
    });
  }

  // 2. Seed Cities Table
  for (const [continent, cities] of Object.entries(PLACES_BY_CONTINENT)) {
    for (const city of cities) {
      await prisma.city.create({
        data: {
          name: city.name,
          slug: city.slug,
          continent,
          count: city.count,
          icon: city.icon,
          tint: city.tint,
        },
      });
    }
  }

  // 3. Create Users
  const defaultPassword = await bcrypt.hash('test123', 10);

  const alexa = await prisma.user.create({
    data: {
      name: 'Alexa Orent',
      email: 'alexa@agihouse.org',
      password: defaultPassword,
      avatarUrl: 'https://images.lumacdn.com/avatars/7l/7860ba89-4a48-4147-9d29-2fd0ac9a724f.png',
      bio: 'Partner @ AGI House. Building the future of AI & robotics.',
      username: 'alexaorent',
      twitterHandle: 'alexaorent',
      instagramHandle: 'agihouse_org',
      website: 'https://agihouse.org',
      isVerified: true,
    },
  });

  const rocky = await prisma.user.create({
    data: {
      name: 'Rocky Yu',
      email: 'rocky@agihouse.org',
      password: defaultPassword,
      avatarUrl: 'https://cdn.lu.ma/avatars-default/avatar_20.png',
      bio: 'Founder of AGI House. Hosting top founders & builders.',
      username: 'rockyyu',
      twitterHandle: 'rockyyu',
      isVerified: true,
    },
  });

  const deepmindUser = await prisma.user.create({
    data: {
      name: 'Google DeepMind',
      email: 'dev-rel@deepmind.google',
      password: defaultPassword,
      avatarUrl: 'https://images.lumacdn.com/calendars/ph/5ee73ff7-6554-47d8-8505-4306f1091baa.jpg',
      bio: 'Google DeepMind Developer Experience & Community Team.',
      username: 'google-deepmind',
      twitterHandle: 'GoogleDeepMind',
      website: 'https://deepmind.google',
      isVerified: true,
    },
  });

  const grace = await prisma.user.create({
    data: {
      name: 'Grace Ling',
      email: 'grace@designbuddies.community',
      password: defaultPassword,
      avatarUrl: 'https://images.lumacdn.com/avatars/xn/04392226-d605-4c28-a6b9-2631bfcfd80e',
      bio: 'Founder of Design Buddies, largest community for designers.',
      username: 'graceling',
      twitterHandle: 'gracelingdesign',
      isVerified: true,
    },
  });

  const radiusUser = await prisma.user.create({
    data: {
      name: 'Radius Society',
      email: 'hello@radiussociety.com',
      password: defaultPassword,
      avatarUrl: 'https://images.lumacdn.com/uploads/ml/3413036a-eb92-4ace-af03-b77d0e68dd95.jpg',
      instagramHandle: 'radiussociety',
      isVerified: true,
      bio: 'Movement, mindfulness, community fitness & clean nutrition.',
      username: 'radiussociety',
    },
  });

  // 4. Featured Calendars from discover/page.tsx
  const FEATURED_CALENDARS = [
    {
      name: 'Google DeepMind',
      slug: 'deepmind',
      avatarUrl: 'https://images.lumacdn.com/calendars/ph/5ee73ff7-6554-47d8-8505-4306f1091baa.jpg',
      coverUrl: 'https://images.lumacdn.com/calendar-cover-images/25/552610cc-c49b-4ff6-85f2-038915b899dd.png',
      tintColor: '#4286f5',
      subscriberCount: 14200,
      description: 'Connect with the Google DeepMind Developer Experience Team. Hackathons, workshops, and AI showcases.',
      ownerId: deepmindUser.id,
    },
    {
      name: 'Reading Rhythms Global',
      slug: 'readingrhythms-global',
      avatarUrl: 'https://images.lumacdn.com/calendars/ni/4f930fb4-2ff5-4e98-8f46-7107a8c6b7cb',
      coverUrl: 'https://images.lumacdn.com/uploads/3g/f33c0b3c-9090-40bb-b99c-875b534bcee4.png',
      tintColor: '#2f7ca9',
      subscriberCount: 22400,
      description: 'Not a book club. A reading party. Read with friends to live music & curated playlists!',
      ownerId: alexa.id,
    },
    {
      name: 'Build Club',
      slug: 'buildercommunityanz',
      avatarUrl: 'https://images.lumacdn.com/calendars/xv/cd043d3e-0ce7-490f-9970-f27a79399858',
      coverUrl: 'https://images.lumacdn.com/uploads/v7/3f6baafa-d90d-4013-9853-0fa10331f796.png',
      tintColor: '#146AEB',
      subscriberCount: 30000,
      description: 'The most collaborative AI community in the world (50+ Cities, 30K+ community).',
      ownerId: rocky.id,
    },
    {
      name: 'South Park Commons',
      slug: 'southparkcommons-events',
      avatarUrl: 'https://images.lumacdn.com/calendars/zd/801eab25-f945-44b2-8d32-29a455bd485d',
      coverUrl: 'https://images.lumacdn.com/uploads/0z/c1143c0e-a2ab-4434-b82b-80b0ba3ec2f0.png',
      tintColor: '#131517',
      subscriberCount: 18900,
      description: 'South Park Commons helps you get from -1 to 0. Real conversations with top founders and researchers.',
      ownerId: rocky.id,
    },
    {
      name: 'Design Buddies',
      slug: 'design',
      avatarUrl: 'https://images.lumacdn.com/calendars/pt/e584cc5b-7a57-4f13-ab7a-2abcb3a4c1a9',
      coverUrl: 'https://images.lumacdn.com/uploads/u8/5eeba5a4-d305-4bc1-9017-329937813f30.png',
      tintColor: '#87BDF9',
      subscriberCount: 35000,
      description: 'Events for all creatives across SF/LA, online, and the world! Founded by Grace Ling.',
      ownerId: grace.id,
    },
    {
      name: 'SpaceXAI Community',
      slug: 'spacexai-community',
      avatarUrl: 'https://images.lumacdn.com/uploads/zm/9c632192-f465-4db5-b8d2-effa261cbb27.png',
      coverUrl: 'https://images.lumacdn.com/uploads/ul/347bf4cf-3703-4559-9b27-c3ffc37e1dd7.png',
      tintColor: '#ff6519',
      subscriberCount: 16700,
      description: 'SpaceXAI frontier intelligence community meetups and research circles in 250+ cities.',
      ownerId: alexa.id,
    },
    {
      name: 'Creative Coffee Club',
      slug: 'coffeeclubworldwide',
      avatarUrl: 'https://images.lumacdn.com/calendars/i2/63802dd5-e4ec-41e5-8559-35f64795e652.png',
      coverUrl: 'https://images.lumacdn.com/uploads/36/a77db635-cb3b-4720-9758-2bc9dae948e4.png',
      tintColor: '#ED2B32',
      subscriberCount: 19500,
      description: 'Unique experiences for creatives and builders in NYC, SF, Toronto, London, Chicago, Austin, and Miami.',
      ownerId: alexa.id,
    },
    {
      name: 'AGI House',
      slug: 'agihouse',
      avatarUrl: 'https://images.lumacdn.com/uploads/zm/9c632192-f465-4db5-b8d2-effa261cbb27.png',
      coverUrl: 'https://images.lumacdn.com/uploads/ul/347bf4cf-3703-4559-9b27-c3ffc37e1dd7.png',
      tintColor: '#ff6519',
      subscriberCount: 28500,
      description: 'The legendary residency and incubator for frontier AI founders, researchers, and builders.',
      ownerId: alexa.id,
    },
  ];

  const calendarsBySlug: Record<string, any> = {};
  for (const cal of FEATURED_CALENDARS) {
    const created = await prisma.calendar.create({ data: cal });
    calendarsBySlug[cal.slug] = created;
  }

  // Base dates
  const now = new Date();
  const oct24 = new Date(now.getFullYear(), 9, 24, 10, 0, 0);
  const oct24End = new Date(now.getFullYear(), 9, 24, 17, 0, 0);

  const oct28 = new Date(now.getFullYear(), 9, 28, 9, 0, 0);
  const oct28End = new Date(now.getFullYear(), 9, 28, 18, 0, 0);

  const nov05 = new Date(now.getFullYear(), 10, 5, 18, 0, 0);
  const nov05End = new Date(now.getFullYear(), 10, 5, 21, 3, 0);

  const nov12 = new Date(now.getFullYear(), 10, 12, 14, 0, 0);
  const nov12End = new Date(now.getFullYear(), 10, 12, 19, 0, 0);

  const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const pastDateEnd = new Date(pastDate.getTime() + 4 * 60 * 60 * 1000);

  // 1. The Google Gemma Hardware Hackathon
  const gemmaEvent = await prisma.event.create({
    data: {
      slug: 'gemma-hardware-hackathon',
      name: 'The Google Gemma Hardware Hackathon',
      description: `Build the Future of Edge & Physical AI.\nJoin us at the legendary AGI House for the builder finale to Open Source AI Week.\n\nBuilt from the same world-class research and technology as Gemini, Gemma 4 is the most capable open model family you can run on your hardware. We invite you to invent the future of embodied intelligence and edge applications with Gemma. Spend an intensive, high-speed day building 100% local applications running on bare metal.\n\nGet hands-on experience with the latest Gemma models and push the absolute limits of edge silicon.\n\nSpace is strictly limited to 120 curated builders. Food, snacks, drinks, loaner hardware kits, and prizes provided!`,
      coverUrl: 'https://images.lumacdn.com/uploads/ul/347bf4cf-3703-4559-9b27-c3ffc37e1dd7.png',
      startAt: oct24,
      endAt: oct24End,
      timezone: 'America/Los_Angeles',
      locationType: 'offline',
      address: '1868 Floribunda Ave',
      city: 'Hillsborough',
      region: 'CA',
      country: 'USA',
      latitude: 37.5726588,
      longitude: -122.3604164,
      requireApproval: true,
      maxCapacity: 120,
      category: ['#AI'],
      tintColor: '#2e72e0',
      hostId: alexa.id,
      calendarId: calendarsBySlug['deepmind'].id,
      tickets: {
        create: [
          {
            name: 'Hacker Pass (Approval Required)',
            description: 'Full day access, loaner hardware, mentorship, meals & drinks.',
            type: 'free',
            price: 0,
            capacity: 100,
            requireApproval: true,
          },
          {
            name: 'Demo Showcase & Mixer (Evening)',
            description: 'Access to top 6 demos, keynote, and evening mixer (4:00 PM - 6:00 PM).',
            type: 'free',
            price: 0,
            capacity: 50,
            requireApproval: true,
          },
        ],
      },
    },
    include: {
      tickets: true,
    },
  });

  const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify({
    ticketKey: 'helio-pass-sam-altman-001',
    eventSlug: 'gemma-hardware-hackathon',
    attendee: 'Sam Altman',
    status: 'APPROVED',
  }));

  await prisma.registration.create({
    data: {
      eventId: gemmaEvent.id,
      ticketId: gemmaEvent.tickets[0].id,
      name: 'Sam Altman',
      email: 'sam@openai.com',
      status: 'APPROVED',
      ticketKey: randomUUID(),
      qrCode: qrCodeDataUrl,
      notes: 'Hardware hacker and founder',
      answers: JSON.stringify({
        projectIdea: 'Local edge vision device running Gemma 4B',
        hardwareNeeded: 'Jetson Orin Nano',
      }),
    },
  });

  // 2. Cerebral Valley AI Summit
  await prisma.event.create({
    data: {
      slug: 'cerebral-valley-ai-summit',
      name: 'Cerebral Valley AI Summit & Hackathon',
      description: `Cerebral Valley brings together the world's most talented AI founders, researchers, and engineers for 48 hours of intense hacking and product launches.\n\nKeynote speakers from frontier AI labs, $100k in compute credits, and judges from top tier venture capital firms.`,
      coverUrl: 'https://images.lumacdn.com/uploads/0z/c1143c0e-a2ab-4434-b82b-80b0ba3ec2f0.png',
      startAt: oct28,
      endAt: oct28End,
      timezone: 'America/Los_Angeles',
      locationType: 'offline',
      address: '777 Folsom St',
      city: 'San Francisco',
      region: 'CA',
      country: 'USA',
      latitude: 37.7845,
      longitude: -122.401,
      requireApproval: true,
      maxCapacity: 250,
      category: ['#Tech'],
      tintColor: '#ff6519',
      hostId: rocky.id,
      calendarId: calendarsBySlug['agihouse'].id,
      tickets: {
        create: [
          {
            name: 'General Admission',
            description: 'Access to keynotes, workshops, and networking.',
            type: 'free',
            price: 0,
            capacity: 200,
            requireApproval: false,
          },
        ],
      },
    },
  });

  // 3. Design Buddies SF Mixer
  await prisma.event.create({
    data: {
      slug: 'design-buddies-sf-mixer',
      name: 'Design Buddies SF Mixer & Portfolio Roast',
      description: `Join 200+ product designers, UX researchers, and creative technologists for an evening of friendly portfolio reviews, lightning talks, and drinks!\n\nHosted at Figma HQ in San Francisco. Casual, fun, and high-signal community vibe.`,
      coverUrl: 'https://images.lumacdn.com/uploads/u8/5eeba5a4-d305-4bc1-9017-329937813f30.png',
      startAt: nov05,
      endAt: nov05End,
      timezone: 'America/Los_Angeles',
      locationType: 'offline',
      address: '760 Market St #1000',
      city: 'San Francisco',
      region: 'CA',
      country: 'USA',
      latitude: 37.7879,
      longitude: -122.4075,
      requireApproval: false,
      maxCapacity: 200,
      category: ['#Arts & Culture'],
      tintColor: '#e66c9f',
      hostId: grace.id,
      calendarId: calendarsBySlug['design'].id,
      tickets: {
        create: [
          {
            name: 'RSVP Pass',
            description: 'General entry pass including 2 drink tickets and snacks.',
            type: 'free',
            price: 0,
            capacity: 200,
            requireApproval: false,
          },
        ],
      },
    },
  });

  // 4. Creative Coffee Club Global Meetup (NYC)
  await prisma.event.create({
    data: {
      slug: 'creative-coffee-club-nyc',
      name: 'Creative Coffee Club NYC · Morning Walk & Chat',
      description: `Start your Friday with coffee, fresh air, and deep conversations with designers, founders, and engineers in Washington Square Park.`,
      coverUrl: 'https://images.lumacdn.com/uploads/36/a77db635-cb3b-4720-9758-2bc9dae948e4.png',
      startAt: nov12,
      endAt: nov12End,
      timezone: 'America/New_York',
      locationType: 'offline',
      address: 'Washington Square Park, Greenwich Village',
      city: 'New York',
      region: 'NY',
      country: 'USA',
      latitude: 40.7308,
      longitude: -73.9973,
      requireApproval: false,
      maxCapacity: 60,
      category: ['#Food & Drink'],
      tintColor: '#d77f30',
      hostId: alexa.id,
      calendarId: calendarsBySlug['coffeeclubworldwide'].id,
      tickets: {
        create: [
          {
            name: 'Free RSVP',
            description: 'Meet at the fountain at 8:30 AM.',
            type: 'free',
            price: 0,
            capacity: 60,
            requireApproval: false,
          },
        ],
      },
    },
  });

  // 5. Reading Rhythms Party
  await prisma.event.create({
    data: {
      slug: 'reading-party-live-ambient-strings',
      name: 'Reading Party: Live Ambient Strings & Deep Focus',
      description: `Not a book club. A reading party. Bring whatever book you are currently reading, silence your phone, and enjoy curated live cello and ambient synthesizers with fellow readers.`,
      coverUrl: 'https://images.lumacdn.com/uploads/3g/f33c0b3c-9090-40bb-b99c-875b534bcee4.png',
      startAt: new Date(now.getFullYear(), 10, 15, 19, 0, 0),
      endAt: new Date(now.getFullYear(), 10, 15, 22, 0, 0),
      timezone: 'America/New_York',
      locationType: 'offline',
      address: '99 Gansevoort St, Meatpacking District',
      city: 'New York',
      region: 'NY',
      country: 'USA',
      requireApproval: false,
      maxCapacity: 120,
      category: ['#Books', '#Arts & Culture'],
      tintColor: '#2f7ca9',
      hostId: alexa.id,
      calendarId: calendarsBySlug['readingrhythms-global'].id,
      tickets: {
        create: [
          {
            name: 'General Admission',
            description: 'Includes hot tea and reading lounge seat.',
            type: 'free',
            price: 0,
            capacity: 120,
          },
        ],
      },
    },
  });

  // 6. Build Club ANZ AI Demo Day
  await prisma.event.create({
    data: {
      slug: 'build-club-anz-frontier-ai-demo-night',
      name: 'Build Club ANZ: Frontier AI Demo Night',
      description: `Join Australia & New Zealand's largest AI builder community. 10 rapid-fire 3-minute demos of open-source agentic tools, LLM fine-tunes, and robotics.`,
      coverUrl: 'https://images.lumacdn.com/uploads/v7/3f6baafa-d90d-4013-9853-0fa10331f796.png',
      startAt: new Date(now.getFullYear(), 10, 20, 18, 0, 0),
      endAt: new Date(now.getFullYear(), 10, 20, 21, 0, 0),
      timezone: 'Australia/Sydney',
      locationType: 'offline',
      address: '477 Pitt St, Haymarket',
      city: 'Sydney',
      region: 'NSW',
      country: 'Australia',
      requireApproval: false,
      maxCapacity: 150,
      category: ['#AI', '#Tech'],
      tintColor: '#146AEB',
      hostId: rocky.id,
      calendarId: calendarsBySlug['buildercommunityanz'].id,
      tickets: {
        create: [
          {
            name: 'Hacker Attendee',
            description: 'Demo showcase and networking.',
            type: 'free',
            price: 0,
            capacity: 150,
          },
        ],
      },
    },
  });

  // 7. South Park Commons Research Salon
  await prisma.event.create({
    data: {
      slug: 'spc-minus-one-to-zero-salon',
      name: 'South Park Commons: -1 to 0 Research Salon',
      description: `Off-the-record discussion on emerging paradigm shifts in foundation models and AI agent architectures. For founders, researchers, and technical builders exploring ideas.`,
      coverUrl: 'https://images.lumacdn.com/uploads/0z/c1143c0e-a2ab-4434-b82b-80b0ba3ec2f0.png',
      startAt: new Date(now.getFullYear(), 10, 25, 17, 30, 0),
      endAt: new Date(now.getFullYear(), 10, 25, 20, 30, 0),
      timezone: 'America/Los_Angeles',
      locationType: 'offline',
      address: '479 2nd St',
      city: 'San Francisco',
      region: 'CA',
      country: 'USA',
      requireApproval: true,
      maxCapacity: 75,
      category: ['#Tech', '#AI'],
      tintColor: '#131517',
      hostId: rocky.id,
      calendarId: calendarsBySlug['southparkcommons-events'].id,
      tickets: {
        create: [
          {
            name: 'Curated Guest Pass',
            description: 'Requires approval from SPC fellows.',
            type: 'free',
            price: 0,
            capacity: 75,
            requireApproval: true,
          },
        ],
      },
    },
  });

  // 8. SpaceXAI Frontier Meetup
  await prisma.event.create({
    data: {
      slug: 'spacexai-frontier-intelligence-circle',
      name: 'SpaceXAI Frontier Intelligence Circle',
      description: `Monthly technical meetup exploring autonomous space exploration, satellite constellations, and frontier compute models.`,
      coverUrl: 'https://images.lumacdn.com/uploads/zm/9c632192-f465-4db5-b8d2-effa261cbb27.png',
      startAt: new Date(now.getFullYear(), 10, 30, 18, 30, 0),
      endAt: new Date(now.getFullYear(), 10, 30, 21, 30, 0),
      timezone: 'America/Los_Angeles',
      locationType: 'offline',
      address: '1 Rocket Rd',
      city: 'Hawthorne',
      region: 'CA',
      country: 'USA',
      requireApproval: true,
      maxCapacity: 100,
      category: ['#AI', '#Tech'],
      tintColor: '#ff6519',
      hostId: alexa.id,
      calendarId: calendarsBySlug['spacexai-community'].id,
      tickets: {
        create: [
          {
            name: 'Security Cleared Attendee',
            description: 'Badge issuance requires pre-registration.',
            type: 'free',
            price: 0,
            capacity: 100,
            requireApproval: true,
          },
        ],
      },
    },
  });

  // 9. Past event: Encode London Hackathon
  await prisma.event.create({
    data: {
      slug: 'encode-london-hackathon-2026',
      name: 'Encode London Hackathon',
      description: 'Global builders hacking across web3 and AI infrastructure in central London.',
      coverUrl: 'https://images.lumacdn.com/uploads/di/2d95d3de-d3be-4e65-92c9-6d083ddf2810.jpg',
      startAt: pastDate,
      endAt: pastDateEnd,
      timezone: 'Europe/London',
      locationType: 'offline',
      address: 'Encode Hub, Shoreditch',
      city: 'London',
      region: 'England',
      country: 'UK',
      latitude: 51.5275,
      longitude: -0.0837,
      requireApproval: false,
      maxCapacity: 150,
      category: ['#Tech'],
      tintColor: '#18a2b5',
      hostId: deepmindUser.id,
      calendarId: calendarsBySlug['deepmind'].id,
      tickets: {
        create: [
          {
            name: 'General Admission',
            description: 'Full pass to Encode London',
            type: 'free',
            price: 0,
            capacity: 150,
          },
        ],
      },
    },
  });

  // Popular Jakarta Events from discover/page.tsx
  const jakartaEvents = [
    {
      slug: '247-x-pepro-run-jakarta',
      name: '247 X PÈPRO RUN: JAKARTA',
      description: 'Join the 247 Run Club in collaboration with PÈPRO for an energetic morning 5K & 10K community run through the heart of South Jakarta.\n\nRefreshments, hydration stations, and exclusive finisher runner packs provided.',
      coverUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop&q=80',
      startAt: new Date(now.getFullYear(), 9, 18, 5, 30, 0),
      endAt: new Date(now.getFullYear(), 9, 18, 8, 30, 0),
      timezone: 'Asia/Jakarta',
      locationType: 'offline',
      address: 'Hustle Mahakam',
      city: 'Jakarta',
      region: 'DKI Jakarta',
      country: 'Indonesia',
      category: ['#Running'],
      tintColor: '#2563eb',
      hostId: alexa.id,
      tickets: [
        {
          name: 'General Admission',
          description: 'Standard 5K/10K run pass',
          type: 'free',
          price: 0,
          currency: 'IDR',
          capacity: 100,
        },
      ],
    },
    {
      slug: 'radius-x-saladstop-goodness-in-motion',
      name: 'Radius x SaladStop! : GOODNESS IN MOTION',
      description: `Radius x SaladStop! : GOODNESS IN MOTION 🏃🥗\n\nDrop bag and meeting point : South Lobby Senayan City (Near Starbucks)\nTime : 5:30 - Start Registration. Please come on time!\n\nLace up your shoes and bring your appetite! Join us for a fun community run followed by delicious, healthy refueling.\n\nWhat’s waiting for you at the finish line?\n👕 Free exclusive jersey\n🥗 Free post-run meal from SaladStop!\n🧃 Free refreshing drinks\n🎉 Plus, exciting games and fun activities!\n\n🎟️ Entry is 100% FREE!`,
      coverUrl: 'https://images.lumacdn.com/uploads/34/701c30c6-affc-40bf-b327-ccb06f9d11af.jpg',
      coverCardUrl: 'https://images.lumacdn.com/uploads/34/701c30c6-affc-40bf-b327-ccb06f9d11af.jpg',
      startAt: new Date(now.getFullYear(), 9, 18, 5, 30, 0),
      endAt: new Date(now.getFullYear(), 9, 18, 9, 30, 0),
      timezone: 'Asia/Jakarta',
      locationType: 'offline',
      address: 'Senayan City Mall, South Lobby (Near Starbucks)',
      city: 'Jakarta',
      region: 'DKI Jakarta',
      country: 'Indonesia',
      category: ['#Fitness'],
      tintColor: '#5a8453',
      requireApproval: true,
      maxCapacity: 93,
      hostId: radiusUser.id,
      tickets: [
        {
          name: 'General Admission',
          description: 'Standard event RSVP pass',
          type: 'free',
          price: 0,
          currency: 'IDR',
          capacity: 90,
          requireApproval: false,
        },
        {
          name: 'VIP Waitlist & Free Jersey',
          description: 'Exclusive front wave runner + free event jersey',
          type: 'vip',
          price: 0,
          currency: 'IDR',
          capacity: 3,
          requireApproval: true,
        },
      ],
      merchandises: [
        {
          name: 'SaladStop! Signature Grain Bowl & Hydration Pack',
          description: 'Nutritious pre-ordered meal box for post-workout recovery.',
          price: 95000,
          currency: 'IDR',
          stock: 50,
          imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      slug: 'indonesias-first-official-miniso-lisa-pop-up',
      name: "Indonesia’s First Official MINISO × LISA Pop-Up",
      description: 'Experience the grand pop-up debut of the exclusive MINISO × LISA collection in Southeast Asia.\n\nDiscover limited-edition lifestyle pieces, interactive photo zones, and special weekend surprises for fans.',
      coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      startAt: new Date(now.getFullYear(), 9, 21, 10, 0, 0),
      endAt: new Date(now.getFullYear(), 9, 21, 22, 0, 0),
      timezone: 'Asia/Jakarta',
      locationType: 'offline',
      address: 'Senayan City Mall',
      city: 'Jakarta',
      region: 'DKI Jakarta',
      country: 'Indonesia',
      category: ['#Arts & Culture'],
      tintColor: '#ec4899',
      hostId: alexa.id,
      tickets: [
        {
          name: 'General Admission',
          description: 'Entry pass to pop-up zones',
          type: 'free',
          price: 0,
          currency: 'IDR',
          capacity: 500,
        },
      ],
    },
    {
      slug: 'road-to-devfest-monthly-meetup-gdg-cloud-jakarta',
      name: 'Road to DevFest: Monthly Meetup October by GDG Cloud Jakarta',
      description: 'Get ready for DevFest 2026 with GDG Cloud Jakarta! Hands-on sessions on modern cloud architectures, generative AI agents on Google Cloud, and networking with fellow developers.',
      coverUrl: 'https://images.lumacdn.com/uploads/0z/c1143c0e-a2ab-4434-b82b-80b0ba3ec2f0.png',
      startAt: new Date(now.getFullYear(), 9, 22, 18, 30, 0),
      endAt: new Date(now.getFullYear(), 9, 22, 21, 30, 0),
      timezone: 'Asia/Jakarta',
      locationType: 'offline',
      address: 'Senayan City Mall',
      city: 'Jakarta',
      region: 'DKI Jakarta',
      country: 'Indonesia',
      category: ['#Tech'],
      tintColor: '#3b82f6',
      hostId: alexa.id,
      tickets: [
        {
          name: 'Developer Pass',
          description: 'Access to tech sessions & pizza',
          type: 'free',
          price: 0,
          currency: 'IDR',
          capacity: 150,
        },
      ],
    },
    {
      slug: 'indonesia-temporal-user-group',
      name: 'Indonesia Temporal User Group',
      description: 'Connect with software engineers and backend architects utilizing Temporal for mission-critical durable execution and resilient event workflows.\n\nTalks, Q&A, and networking over pizza.',
      coverUrl: 'https://images.lumacdn.com/uploads/v7/3f6baafa-d90d-4013-9853-0fa10331f796.png',
      startAt: new Date(now.getFullYear(), 10, 10, 18, 0, 0),
      endAt: new Date(now.getFullYear(), 10, 10, 21, 0, 0),
      timezone: 'Asia/Jakarta',
      locationType: 'offline',
      address: 'GoWork Menara Rajawali - Coworking and Office Space',
      city: 'Jakarta',
      region: 'DKI Jakarta',
      country: 'Indonesia',
      category: ['#Tech'],
      tintColor: '#8b5cf6',
      hostId: alexa.id,
      tickets: [
        {
          name: 'Attendee Pass',
          description: 'General RSVP pass',
          type: 'free',
          price: 0,
          currency: 'IDR',
          capacity: 80,
        },
      ],
    },
  ];

  for (const jEvt of jakartaEvents) {
    const { tickets, merchandises, ...eventData } = jEvt;
    await prisma.event.create({
      data: {
        ...eventData,
        tickets: tickets
          ? {
              create: tickets,
            }
          : undefined,
        merchandises: merchandises
          ? {
              create: merchandises,
            }
          : undefined,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
