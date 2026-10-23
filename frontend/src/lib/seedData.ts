import { Calendar, CategoryItem, CityItem, EventItem, Host, Registration, UserProfile } from './api';

// Hosts
export const MOCK_HOSTS: Record<string, Host> = {
  alexa: {
    id: 'user-alexa',
    name: 'Alexa Orent',
    email: 'alexa@agihouse.org',
    avatarUrl: 'https://images.lumacdn.com/avatars/7l/7860ba89-4a48-4147-9d29-2fd0ac9a724f.png',
    bio: 'Partner @ AGI House. Building the future of AI & robotics.',
    username: 'alexaorent',
    twitterHandle: 'alexaorent',
    instagramHandle: 'agihouse_org',
    website: 'https://agihouse.org',
    isVerified: true,
  },
  rocky: {
    id: 'user-rocky',
    name: 'Rocky Yu',
    email: 'rocky@agihouse.org',
    avatarUrl: 'https://cdn.lu.ma/avatars-default/avatar_20.png',
    bio: 'Founder of AGI House. Hosting top founders & builders.',
    username: 'rockyyu',
    twitterHandle: 'rockyyu',
    isVerified: true,
  },
  deepmind: {
    id: 'user-deepmind',
    name: 'Google DeepMind',
    email: 'dev-rel@deepmind.google',
    avatarUrl: 'https://images.lumacdn.com/calendars/ph/5ee73ff7-6554-47d8-8505-4306f1091baa.jpg',
    bio: 'Google DeepMind Developer Experience & Community Team.',
    username: 'google-deepmind',
    twitterHandle: 'GoogleDeepMind',
    website: 'https://deepmind.google',
    isVerified: true,
  },
  grace: {
    id: 'user-grace',
    name: 'Grace Ling',
    email: 'grace@designbuddies.community',
    avatarUrl: 'https://images.lumacdn.com/avatars/xn/04392226-d605-4c28-a6b9-2631bfcfd80e',
    bio: 'Founder of Design Buddies, largest community for designers.',
    username: 'graceling',
    twitterHandle: 'gracelingdesign',
    isVerified: true,
  },
  radius: {
    id: 'user-radius',
    name: 'Radius Society',
    email: 'hello@radiussociety.com',
    avatarUrl: 'https://images.lumacdn.com/uploads/ml/3413036a-eb92-4ace-af03-b77d0e68dd95.jpg',
    bio: 'Movement, mindfulness, community fitness & clean nutrition.',
    username: 'radiussociety',
    instagramHandle: 'radiussociety',
    isVerified: true,
  },
};

// Categories
export const MOCK_CATEGORIES: CategoryItem[] = [
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

// Cities
export const MOCK_CITIES: CityItem[] = [
  { name: 'New York', slug: 'nyc', region: 'NY', continent: 'North America', count: 95, icon: 'https://images.lumacdn.com/discovery/nyc-icon.png', tint: '#e08d55' },
  { name: 'San Francisco', slug: 'sf', region: 'CA', continent: 'North America', count: 58, icon: 'https://images.lumacdn.com/discovery/sf-icon.png', tint: '#ff6519' },
  { name: 'Los Angeles', slug: 'la', region: 'CA', continent: 'North America', count: 44, icon: 'https://images.lumacdn.com/discovery/la-icon.png', tint: '#538f21' },
  { name: 'Boston', slug: 'boston', region: 'MA', continent: 'North America', count: 29, icon: 'https://images.lumacdn.com/discovery/boston-icon.png', tint: '#d77f30' },
  { name: 'London', slug: 'london', region: 'England', continent: 'Europe', count: 56, icon: 'https://images.lumacdn.com/discovery/london-icon.png', tint: '#e89800' },
  { name: 'Amsterdam', slug: 'amsterdam', region: 'North Holland', continent: 'Europe', count: 48, icon: 'https://images.lumacdn.com/discovery/ams-icon.png', tint: '#de475e' },
  { name: 'Paris', slug: 'paris', region: 'Île-de-France', continent: 'Europe', count: 23, icon: 'https://images.lumacdn.com/discovery/paris-icon.png', tint: '#ce8f5c' },
  { name: 'Jakarta', slug: 'jakarta', region: 'DKI Jakarta', continent: 'Asia & Pacific', count: 4, icon: 'https://images.lumacdn.com/discovery/dubai-icon.png', tint: '#2c022cff' },
  { name: 'Tokyo', slug: 'tokyo', region: 'Kanto', continent: 'Asia & Pacific', count: 40, icon: 'https://images.lumacdn.com/discovery/tokyo-icon.png', tint: '#e69f93' },
  { name: 'Singapore', slug: 'singapore', region: 'Singapore', continent: 'Asia & Pacific', count: 24, icon: 'https://images.lumacdn.com/discovery/miami-icon.png', tint: '#408dae' },
  { name: 'Dubai', slug: 'dubai', region: 'Dubai', continent: 'Asia & Pacific', count: 14, icon: 'https://images.lumacdn.com/discovery/dubai-icon.png', tint: '#ab52ab' },
  { name: 'Sydney', slug: 'sydney', region: 'NSW', continent: 'Asia & Pacific', count: 18, icon: 'https://images.lumacdn.com/discovery/dubai-icon.png', tint: '#146AEB' },
];

// Calendars
export const MOCK_CALENDARS: Calendar[] = [
  {
    id: 'cal-deepmind',
    name: 'Google DeepMind',
    slug: 'deepmind',
    avatarUrl: 'https://images.lumacdn.com/calendars/ph/5ee73ff7-6554-47d8-8505-4306f1091baa.jpg',
    coverUrl: 'https://images.lumacdn.com/calendar-cover-images/25/552610cc-c49b-4ff6-85f2-038915b899dd.png',
    tintColor: '#4286f5',
    subscriberCount: 14200,
    description: 'Connect with the Google DeepMind Developer Experience Team. Hackathons, workshops, and AI showcases.',
    ownerId: MOCK_HOSTS.deepmind.id,
    owner: MOCK_HOSTS.deepmind,
  },
  {
    id: 'cal-readingrhythms',
    name: 'Reading Rhythms Global',
    slug: 'readingrhythms-global',
    avatarUrl: 'https://images.lumacdn.com/calendars/ni/4f930fb4-2ff5-4e98-8f46-7107a8c6b7cb',
    coverUrl: 'https://images.lumacdn.com/uploads/3g/f33c0b3c-9090-40bb-b99c-875b534bcee4.png',
    tintColor: '#2f7ca9',
    subscriberCount: 22400,
    description: 'Not a book club. A reading party. Read with friends to live music & curated playlists!',
    ownerId: MOCK_HOSTS.alexa.id,
    owner: MOCK_HOSTS.alexa,
  },
  {
    id: 'cal-buildclub',
    name: 'Build Club',
    slug: 'buildercommunityanz',
    avatarUrl: 'https://images.lumacdn.com/calendars/xv/cd043d3e-0ce7-490f-9970-f27a79399858',
    coverUrl: 'https://images.lumacdn.com/uploads/v7/3f6baafa-d90d-4013-9853-0fa10331f796.png',
    tintColor: '#146AEB',
    subscriberCount: 30000,
    description: 'The most collaborative AI community in the world (50+ Cities, 30K+ community).',
    ownerId: MOCK_HOSTS.rocky.id,
    owner: MOCK_HOSTS.rocky,
  },
  {
    id: 'cal-spc',
    name: 'South Park Commons',
    slug: 'southparkcommons-events',
    avatarUrl: 'https://images.lumacdn.com/calendars/zd/801eab25-f945-44b2-8d32-29a455bd485d',
    coverUrl: 'https://images.lumacdn.com/uploads/0z/c1143c0e-a2ab-4434-b82b-80b0ba3ec2f0.png',
    tintColor: '#131517',
    subscriberCount: 18900,
    description: 'South Park Commons helps you get from -1 to 0. Real conversations with top founders and researchers.',
    ownerId: MOCK_HOSTS.rocky.id,
    owner: MOCK_HOSTS.rocky,
  },
  {
    id: 'cal-design',
    name: 'Design Buddies',
    slug: 'design',
    avatarUrl: 'https://images.lumacdn.com/calendars/pt/e584cc5b-7a57-4f13-ab7a-2abcb3a4c1a9',
    coverUrl: 'https://images.lumacdn.com/uploads/u8/5eeba5a4-d305-4bc1-9017-329937813f30.png',
    tintColor: '#87BDF9',
    subscriberCount: 35000,
    description: 'Events for all creatives across SF/LA, online, and the world! Founded by Grace Ling.',
    ownerId: MOCK_HOSTS.grace.id,
    owner: MOCK_HOSTS.grace,
  },
];

const now = new Date();
const relDate = (daysAhead: number, hour = 18, minute = 0) => {
  const d = new Date(now.getTime() + daysAhead * 86400000);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// Events Seed
export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt-gemma-hardware',
    slug: 'gemma-hardware-hackathon',
    name: 'The Google Gemma Hardware Hackathon',
    description: `Build the Future of Edge & Physical AI.\nJoin us at the legendary AGI House for the builder finale to Open Source AI Week.\n\nBuilt from the same world-class research and technology as Gemini, Gemma 4 is the most capable open model family you can run on your hardware. We invite you to invent the future of embodied intelligence and edge applications with Gemma. Spend an intensive, high-speed day building 100% local applications running on bare metal.\n\nSpace is strictly limited to 120 curated builders. Food, snacks, drinks, loaner hardware kits, and prizes provided!`,
    coverUrl: 'https://images.lumacdn.com/uploads/ul/347bf4cf-3703-4559-9b27-c3ffc37e1dd7.png',
    startAt: relDate(2, 9, 0),
    endAt: relDate(2, 21, 0),
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
    host: MOCK_HOSTS.alexa,
    calendar: MOCK_CALENDARS[0],
    tickets: [
      {
        id: 't-gemma-1',
        name: 'Hacker Pass (Approval Required)',
        description: 'Full day access, loaner hardware, mentorship, meals & drinks.',
        type: 'free',
        price: 0,
        currency: 'USD',
        capacity: 100,
        requireApproval: true,
      },
      {
        id: 't-gemma-2',
        name: 'Demo Showcase & Mixer (Evening)',
        description: 'Access to top 6 demos, keynote, and evening mixer.',
        type: 'free',
        price: 0,
        currency: 'USD',
        capacity: 50,
        requireApproval: true,
      },
    ],
    registrations: [
      { id: 'reg-sam', name: 'Sam Altman', user: { avatarUrl: 'https://images.lumacdn.com/avatars/7l/7860ba89-4a48-4147-9d29-2fd0ac9a724f.png' } },
    ],
    _count: { registrations: 48 },
  },
  {
    id: 'evt-cerebral-valley',
    slug: 'cerebral-valley-ai-summit',
    name: 'Cerebral Valley AI Summit & Hackathon',
    description: `Cerebral Valley brings together the world's most talented AI founders, researchers, and engineers for 48 hours of intense hacking and product launches.\n\nKeynote speakers from frontier AI labs, $100k in compute credits, and judges from top tier venture capital firms.`,
    coverUrl: 'https://images.lumacdn.com/uploads/0z/c1143c0e-a2ab-4434-b82b-80b0ba3ec2f0.png',
    startAt: relDate(5, 10, 0),
    endAt: relDate(7, 18, 0),
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
    host: MOCK_HOSTS.rocky,
    calendar: MOCK_CALENDARS[3],
    tickets: [
      {
        id: 't-cv-1',
        name: 'General Admission',
        description: 'Access to keynotes, workshops, and networking.',
        type: 'free',
        price: 0,
        currency: 'USD',
        capacity: 200,
        requireApproval: false,
      },
    ],
    _count: { registrations: 182 },
  },
  {
    id: 'evt-design-buddies',
    slug: 'design-buddies-sf-mixer',
    name: 'Design Buddies SF Mixer & Portfolio Roast',
    description: `Join 200+ product designers, UX researchers, and creative technologists for an evening of friendly portfolio reviews, lightning talks, and drinks!\n\nHosted at Figma HQ in San Francisco. Casual, fun, and high-signal community vibe.`,
    coverUrl: 'https://images.lumacdn.com/uploads/u8/5eeba5a4-d305-4bc1-9017-329937813f30.png',
    startAt: relDate(8, 18, 30),
    endAt: relDate(8, 21, 30),
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
    host: MOCK_HOSTS.grace,
    calendar: MOCK_CALENDARS[4],
    tickets: [
      {
        id: 't-db-1',
        name: 'RSVP Pass',
        description: 'General entry pass including 2 drink tickets and snacks.',
        type: 'free',
        price: 0,
        currency: 'USD',
        capacity: 200,
        requireApproval: false,
      },
    ],
    _count: { registrations: 145 },
  },
  {
    id: 'evt-creative-coffee',
    slug: 'creative-coffee-club-nyc',
    name: 'Creative Coffee Club NYC · Morning Walk & Chat',
    description: `Start your Friday with coffee, fresh air, and deep conversations with designers, founders, and engineers in Washington Square Park.`,
    coverUrl: 'https://images.lumacdn.com/uploads/36/a77db635-cb3b-4720-9758-2bc9dae948e4.png',
    startAt: relDate(10, 8, 30),
    endAt: relDate(10, 10, 30),
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
    host: MOCK_HOSTS.alexa,
    tickets: [
      {
        id: 't-ccc-1',
        name: 'Free RSVP',
        description: 'Meet at the fountain at 8:30 AM.',
        type: 'free',
        price: 0,
        currency: 'USD',
        capacity: 60,
        requireApproval: false,
      },
    ],
    _count: { registrations: 52 },
  },
  {
    id: 'evt-reading-rhythms',
    slug: 'reading-party-live-ambient-strings',
    name: 'Reading Party: Live Ambient Strings & Deep Focus',
    description: `Not a book club. A reading party. Bring whatever book you are currently reading, silence your phone, and enjoy curated live cello and ambient synthesizers with fellow readers.`,
    coverUrl: 'https://images.lumacdn.com/uploads/3g/f33c0b3c-9090-40bb-b99c-875b534bcee4.png',
    startAt: relDate(12, 19, 0),
    endAt: relDate(12, 22, 0),
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
    host: MOCK_HOSTS.alexa,
    calendar: MOCK_CALENDARS[1],
    tickets: [
      {
        id: 't-rr-1',
        name: 'General Admission',
        description: 'Includes hot tea and reading lounge seat.',
        type: 'free',
        price: 0,
        currency: 'USD',
        capacity: 120,
        requireApproval: false,
      },
    ],
    _count: { registrations: 110 },
  },
  {
    id: 'evt-radius-saladstop',
    slug: 'radius-x-saladstop-goodness-in-motion',
    name: 'Radius x SaladStop! : GOODNESS IN MOTION',
    description: `Radius x SaladStop! : GOODNESS IN MOTION 🏃🥗\n\nDrop bag and meeting point : South Lobby Senayan City (Near Starbucks)\nTime : 5:30 - Start Registration. Please come on time!\n\nLace up your shoes and bring your appetite! Join us for a fun community run followed by delicious, healthy refueling.\n\nWhat’s waiting for you at the finish line?\n👕 Free exclusive jersey\n🥗 Free post-run meal from SaladStop!\n🧃 Free refreshing drinks\n🎉 Plus, exciting games and fun activities!\n\n🎟️ Entry is 100% FREE!`,
    coverUrl: 'https://images.lumacdn.com/uploads/34/701c30c6-affc-40bf-b327-ccb06f9d11af.jpg',
    coverCardUrl: 'https://images.lumacdn.com/uploads/34/701c30c6-affc-40bf-b327-ccb06f9d11af.jpg',
    startAt: relDate(3, 5, 30),
    endAt: relDate(3, 9, 30),
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
    host: MOCK_HOSTS.radius,
    tickets: [
      {
        id: 't-rs-1',
        name: 'General Admission',
        description: 'Standard event RSVP pass',
        type: 'free',
        price: 0,
        currency: 'IDR',
        capacity: 90,
        requireApproval: false,
      },
      {
        id: 't-rs-2',
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
        id: 'm-rs-1',
        name: 'SaladStop! Signature Grain Bowl & Hydration Pack',
        description: 'Nutritious pre-ordered meal box for post-workout recovery.',
        price: 95000,
        currency: 'IDR',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      },
    ],
    _count: { registrations: 89 },
  },
  {
    id: 'evt-pepro-run-jakarta',
    slug: '247-x-pepro-run-jakarta',
    name: '247 X PÈPRO RUN: JAKARTA',
    description: 'Join the 247 Run Club in collaboration with PÈPRO for an energetic morning 5K & 10K community run through the heart of South Jakarta.\n\nRefreshments, hydration stations, and exclusive finisher runner packs provided.',
    coverUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop&q=80',
    startAt: relDate(6, 5, 30),
    endAt: relDate(6, 8, 30),
    timezone: 'Asia/Jakarta',
    locationType: 'offline',
    address: 'Hustle Mahakam',
    city: 'Jakarta',
    region: 'DKI Jakarta',
    country: 'Indonesia',
    requireApproval: false,
    category: ['#Running'],
    tintColor: '#2563eb',
    host: MOCK_HOSTS.alexa,
    tickets: [
      {
        id: 't-pr-1',
        name: 'General Admission',
        description: 'Standard 5K/10K run pass',
        type: 'free',
        price: 0,
        currency: 'IDR',
        capacity: 100,
        requireApproval: false,
      },
    ],
    _count: { registrations: 76 },
  },
  {
    id: 'evt-miniso-lisa',
    slug: 'indonesias-first-official-miniso-lisa-pop-up',
    name: "Indonesia’s First Official MINISO × LISA Pop-Up",
    description: 'Experience the grand pop-up debut of the exclusive MINISO × LISA collection in Southeast Asia.\n\nDiscover limited-edition lifestyle pieces, interactive photo zones, and special weekend surprises for fans.',
    coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    startAt: relDate(9, 10, 0),
    endAt: relDate(9, 22, 0),
    timezone: 'Asia/Jakarta',
    locationType: 'offline',
    address: 'Senayan City Mall',
    city: 'Jakarta',
    region: 'DKI Jakarta',
    country: 'Indonesia',
    requireApproval: false,
    category: ['#Arts & Culture'],
    tintColor: '#ec4899',
    host: MOCK_HOSTS.alexa,
    tickets: [
      {
        id: 't-ml-1',
        name: 'General Admission',
        description: 'Entry pass to pop-up zones',
        type: 'free',
        price: 0,
        currency: 'IDR',
        capacity: 500,
        requireApproval: false,
      },
    ],
    _count: { registrations: 412 },
  },
  {
    id: 'evt-gdg-jakarta',
    slug: 'road-to-devfest-monthly-meetup-gdg-cloud-jakarta',
    name: 'Road to DevFest: Monthly Meetup October by GDG Cloud Jakarta',
    description: 'Get ready for DevFest 2026 with GDG Cloud Jakarta! Hands-on sessions on modern cloud architectures, generative AI agents on Google Cloud, and networking with fellow developers.',
    coverUrl: 'https://images.lumacdn.com/uploads/0z/c1143c0e-a2ab-4434-b82b-80b0ba3ec2f0.png',
    startAt: relDate(11, 18, 30),
    endAt: relDate(11, 21, 30),
    timezone: 'Asia/Jakarta',
    locationType: 'offline',
    address: 'Senayan City Mall',
    city: 'Jakarta',
    region: 'DKI Jakarta',
    country: 'Indonesia',
    requireApproval: false,
    category: ['#Tech'],
    tintColor: '#3b82f6',
    host: MOCK_HOSTS.alexa,
    tickets: [
      {
        id: 't-gdg-1',
        name: 'Developer Pass',
        description: 'Access to tech sessions & pizza',
        type: 'free',
        price: 0,
        currency: 'IDR',
        capacity: 150,
        requireApproval: false,
      },
    ],
    _count: { registrations: 120 },
  },
  {
    id: 'evt-encode-london',
    slug: 'encode-london-hackathon-2026',
    name: 'Encode London Hackathon',
    description: 'Global builders hacking across web3 and AI infrastructure in central London.',
    coverUrl: 'https://images.lumacdn.com/uploads/di/2d95d3de-d3be-4e65-92c9-6d083ddf2810.jpg',
    startAt: relDate(-14, 10, 0),
    endAt: relDate(-12, 18, 0),
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
    host: MOCK_HOSTS.deepmind,
    calendar: MOCK_CALENDARS[0],
    tickets: [
      {
        id: 't-el-1',
        name: 'General Admission',
        description: 'Full pass to Encode London',
        type: 'free',
        price: 0,
        currency: 'GBP',
        capacity: 150,
        requireApproval: false,
      },
    ],
    _count: { registrations: 150 },
  },
];

// Helper mock filters
export function filterMockEvents(params?: {
  timeframe?: string;
  category?: string;
  city?: string;
  calendarSlug?: string;
  search?: string;
}): EventItem[] {
  let list = [...MOCK_EVENTS];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (params?.timeframe === 'past') {
    list = list.filter((e) => new Date(e.startAt) < today);
  } else if (params?.timeframe === 'upcoming') {
    list = list.filter((e) => new Date(e.startAt) >= today);
  }

  if (params?.category) {
    const cat = params.category.toLowerCase().replace('#', '');
    list = list.filter((e) => {
      const cats = Array.isArray(e.category) ? e.category : [e.category];
      return cats.some((c) => c.toLowerCase().replace('#', '').includes(cat));
    });
  }

  if (params?.city) {
    const targetCity = params.city.toLowerCase();
    list = list.filter((e) => e.city?.toLowerCase() === targetCity);
  }

  if (params?.calendarSlug) {
    list = list.filter((e) => e.calendar?.slug === params.calendarSlug);
  }

  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q) ||
        (Array.isArray(e.category) ? e.category.join(' ') : e.category).toLowerCase().includes(q)
    );
  }

  return list;
}

export function findMockEventBySlug(slug: string): EventItem | null {
  return MOCK_EVENTS.find((e) => e.slug === slug || e.id === slug) || null;
}

export function findMockCalendarBySlug(slug: string): (Calendar & { events: EventItem[]; owner: Host }) | null {
  const cal = MOCK_CALENDARS.find((c) => c.slug === slug || c.id === slug);
  if (!cal) return null;
  const events = MOCK_EVENTS.filter((e) => e.calendar?.slug === cal.slug);
  return {
    ...cal,
    events,
    owner: cal.owner || MOCK_HOSTS.alexa,
  };
}

export function getMockUser(usernameOrId?: string): UserProfile {
  const host = Object.values(MOCK_HOSTS).find(
    (h) => h.username === usernameOrId || h.id === usernameOrId
  ) || MOCK_HOSTS.alexa;

  return {
    ...host,
    events: MOCK_EVENTS.filter((e) => e.host?.id === host.id),
    calendars: MOCK_CALENDARS.filter((c) => c.ownerId === host.id),
    _count: {
      events: 3,
      registrations: 2,
    },
  };
}
