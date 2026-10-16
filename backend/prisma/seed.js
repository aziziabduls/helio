"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const qrcode_1 = __importDefault(require("qrcode"));
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding Luma database...');
    // Clean existing data
    await prisma.registration.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.event.deleteMany();
    await prisma.calendar.deleteMany();
    await prisma.user.deleteMany();
    // Create Users
    const alexa = await prisma.user.create({
        data: {
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
    });
    const rocky = await prisma.user.create({
        data: {
            name: 'Rocky Yu',
            email: 'rocky@agihouse.org',
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
            avatarUrl: 'https://images.lumacdn.com/avatars/xn/04392226-d605-4c28-a6b9-2631bfcfd80e',
            bio: 'Founder of Design Buddies, largest community for designers.',
            username: 'graceling',
            twitterHandle: 'gracelingdesign',
            isVerified: true,
        },
    });
    // Create Calendars
    const deepmindCal = await prisma.calendar.create({
        data: {
            slug: 'deepmind',
            name: 'Google DeepMind',
            description: 'Connect with the Google DeepMind Developer Experience Team. Hackathons, workshops, and research showcases.',
            avatarUrl: 'https://images.lumacdn.com/calendars/ph/5ee73ff7-6554-47d8-8505-4306f1091baa.jpg',
            coverUrl: 'https://images.lumacdn.com/calendar-cover-images/25/552610cc-c49b-4ff6-85f2-038915b899dd.png',
            tintColor: '#2e72e0',
            subscriberCount: 14200,
            ownerId: deepmindUser.id,
        },
    });
    const agiHouseCal = await prisma.calendar.create({
        data: {
            slug: 'agihouse',
            name: 'AGI House',
            description: 'The legendary residency and incubator for frontier AI founders, researchers, and builders.',
            avatarUrl: 'https://images.lumacdn.com/uploads/zm/9c632192-f465-4db5-b8d2-effa261cbb27.png',
            coverUrl: 'https://images.lumacdn.com/uploads/ul/347bf4cf-3703-4559-9b27-c3ffc37e1dd7.png',
            tintColor: '#ff6519',
            subscriberCount: 28500,
            ownerId: alexa.id,
        },
    });
    const designBuddiesCal = await prisma.calendar.create({
        data: {
            slug: 'designbuddies',
            name: 'Design Buddies',
            description: 'Events for all creatives across SF/LA, online, and the world! World’s largest design community.',
            avatarUrl: 'https://images.lumacdn.com/calendars/pt/e584cc5b-7a57-4f13-ab7a-2abcb3a4c1a9',
            coverUrl: 'https://images.lumacdn.com/uploads/u8/5eeba5a4-d305-4bc1-9017-329937813f30.png',
            tintColor: '#e66c9f',
            subscriberCount: 35000,
            ownerId: grace.id,
        },
    });
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
            description: `Build the Future of Edge & Physical AI.
Join us at the legendary AGI House for the builder finale to Open Source AI Week.

Built from the same world-class research and technology as Gemini, Gemma 4 is the most capable open model family you can run on your hardware. We invite you to invent the future of embodied intelligence and edge applications with Gemma. Spend an intensive, high-speed day building 100% local applications running on bare metal.

Get hands-on experience with the latest Gemma models and push the absolute limits of edge silicon.

What you might build:
• Wearable AI that narrates the physical world
• On-device robotics and drone vision
• Local privacy-preserving medical assistants
• Real-time speech and ambient intelligence agents

Space is strictly limited to 120 curated builders. Food, snacks, drinks, loaner hardware kits, and prizes provided!`,
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
            category: 'AI',
            tintColor: '#2e72e0',
            hostId: alexa.id,
            calendarId: deepmindCal.id,
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
    // Seed sample registrations with QR codes for Gemma Event
    const qrCodeDataUrl = await qrcode_1.default.toDataURL(JSON.stringify({
        ticketKey: 'tkt-gemma-001',
        event: 'The Google Gemma Hardware Hackathon',
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
            ticketKey: (0, crypto_1.randomUUID)(),
            qrCode: qrCodeDataUrl,
            notes: 'Hardware hacker and founder',
            answers: JSON.stringify({
                projectIdea: 'Local edge vision device running Gemma 4B',
                hardwareNeeded: 'Jetson Orin Nano',
            }),
        },
    });
    await prisma.registration.create({
        data: {
            eventId: gemmaEvent.id,
            ticketId: gemmaEvent.tickets[0].id,
            name: 'Elena Rostova',
            email: 'elena@robotics.mit.edu',
            status: 'PENDING',
            ticketKey: (0, crypto_1.randomUUID)(),
            notes: 'PhD researcher at MIT CSAIL',
            answers: JSON.stringify({
                projectIdea: 'Quadruped robot spatial navigation',
                hardwareNeeded: 'Unitree Go2 / Raspberry Pi 5',
            }),
        },
    });
    // 2. Cerebral Valley AI Summit
    await prisma.event.create({
        data: {
            slug: 'cerebral-valley-ai-summit',
            name: 'Cerebral Valley AI Summit & Hackathon',
            description: `Cerebral Valley brings together the world's most talented AI founders, researchers, and engineers for 48 hours of intense hacking and product launches.

Keynote speakers from frontier AI labs, $100k in compute credits, and judges from top tier venture capital firms.`,
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
            category: 'Tech',
            tintColor: '#ff6519',
            hostId: rocky.id,
            calendarId: agiHouseCal.id,
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
    // 3. Design Buddies Portfolio Review & Mixer
    await prisma.event.create({
        data: {
            slug: 'design-buddies-sf-mixer',
            name: 'Design Buddies SF Mixer & Portfolio Roast',
            description: `Join 200+ product designers, UX researchers, and creative technologists for an evening of friendly portfolio reviews, lightning talks, and drinks!

Hosted at Figma HQ in San Francisco. Casual, fun, and high-signal community vibe.`,
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
            category: 'Arts & Culture',
            tintColor: '#e66c9f',
            hostId: grace.id,
            calendarId: designBuddiesCal.id,
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
            category: 'Food & Drink',
            tintColor: '#d77f30',
            hostId: alexa.id,
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
    // 5. Past event: Encode London Hackathon
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
            category: 'Tech',
            tintColor: '#18a2b5',
            hostId: deepmindUser.id,
            calendarId: deepmindCal.id,
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
