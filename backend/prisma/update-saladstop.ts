import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const host = await prisma.user.upsert({
    where: { email: 'hello@radiussociety.com' },
    update: {
      name: 'Radius Society',
      avatarUrl: 'https://images.lumacdn.com/uploads/ml/3413036a-eb92-4ace-af03-b77d0e68dd95.jpg',
      instagramHandle: 'radiussociety',
      isVerified: true,
      bio: 'Movement, mindfulness, community fitness & clean nutrition.',
    },
    create: {
      name: 'Radius Society',
      email: 'hello@radiussociety.com',
      avatarUrl: 'https://images.lumacdn.com/uploads/ml/3413036a-eb92-4ace-af03-b77d0e68dd95.jpg',
      instagramHandle: 'radiussociety',
      isVerified: true,
      bio: 'Movement, mindfulness, community fitness & clean nutrition.',
    },
  });

  const event = await prisma.event.upsert({
    where: { slug: 'radius-x-saladstop-goodness-in-motion' },
    update: {
      coverUrl: 'https://images.lumacdn.com/uploads/34/701c30c6-affc-40bf-b327-ccb06f9d11af.jpg',
      coverCardUrl: 'https://images.lumacdn.com/uploads/34/701c30c6-affc-40bf-b327-ccb06f9d11af.jpg',
      tintColor: '#5a8453',
      requireApproval: true,
      maxCapacity: 93,
      hostId: host.id,
      address: 'Senayan City Mall, South Lobby (Near Starbucks)',
      city: 'Jakarta',
      region: 'DKI Jakarta',
      country: 'Indonesia',
      category: 'Fitness',
      description: `Radius x SaladStop! : GOODNESS IN MOTION 🏃🥗

Drop bag and meeting point : South Lobby Senayan City (Near Starbucks)
Time : 5:30 - Start Registration. Please come on time!

Lace up your shoes and bring your appetite! Join us for a fun community run followed by delicious, healthy refueling.

What’s waiting for you at the finish line?
👕 Free exclusive jersey
🥗 Free post-run meal from SaladStop!
🧃 Free refreshing drinks
🎉 Plus, exciting games and fun activities!

🎟️ Entry is 100% FREE!

Please note: Registration operates on a waitlist system. Join the waitlist now, and if your spot is confirmed, you will be notified and receive your ticket directly via email.`,
    },
    create: {
      slug: 'radius-x-saladstop-goodness-in-motion',
      name: 'Radius x SaladStop! : GOODNESS IN MOTION',
      coverUrl: 'https://images.lumacdn.com/uploads/34/701c30c6-affc-40bf-b327-ccb06f9d11af.jpg',
      coverCardUrl: 'https://images.lumacdn.com/uploads/34/701c30c6-affc-40bf-b327-ccb06f9d11af.jpg',
      tintColor: '#5a8453',
      requireApproval: true,
      maxCapacity: 93,
      hostId: host.id,
      address: 'Senayan City Mall, South Lobby (Near Starbucks)',
      city: 'Jakarta',
      region: 'DKI Jakarta',
      country: 'Indonesia',
      category: 'Fitness',
      startAt: new Date(2026, 9, 18, 5, 30, 0),
      endAt: new Date(2026, 9, 18, 9, 30, 0),
      description: `Radius x SaladStop! : GOODNESS IN MOTION 🏃🥗

Drop bag and meeting point : South Lobby Senayan City (Near Starbucks)
Time : 5:30 - Start Registration. Please come on time!

Lace up your shoes and bring your appetite! Join us for a fun community run followed by delicious, healthy refueling.

What’s waiting for you at the finish line?
👕 Free exclusive jersey
🥗 Free post-run meal from SaladStop!
🧃 Free refreshing drinks
🎉 Plus, exciting games and fun activities!

🎟️ Entry is 100% FREE!

Please note: Registration operates on a waitlist system. Join the waitlist now, and if your spot is confirmed, you will be notified and receive your ticket directly via email.`,
    },
  });

  console.log('Updated event:', event.name, event.slug, event.tintColor);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
