import { prisma } from '../db';
import { AppError } from '../utils/response';

export interface GetEventsFilters {
  timeframe?: string;
  category?: string;
  city?: string;
  calendarSlug?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface CreateEventInput {
  name: string;
  slug?: string;
  description?: string;
  coverUrl?: string;
  coverCardUrl?: string;
  hostAvatarUrl?: string;
  hostName?: string;
  userId?: string;
  startAt: string | Date;
  endAt: string | Date;
  timezone?: string;
  locationType?: 'offline' | 'online';
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  virtualUrl?: string;
  requireApproval?: boolean;
  maxCapacity?: number;
  category?: string | string[];
  tintColor?: string;
  font?: string;
  hostEmail?: string;
  calendarSlug?: string;
  tickets?: Array<{
    name?: string;
    description?: string;
    type?: string;
    price?: number;
    currency?: string;
    capacity?: number;
    requireApproval?: boolean;
    saleStartAt?: string | Date;
    saleEndAt?: string | Date;
  }>;
  merchandises?: Array<{
    name: string;
    description?: string;
    price: number;
    currency?: string;
    imageUrl?: string;
    stock?: number;
  }>;
}

export function normalizeCategories(cat: any): string[] {
  if (!cat) return [];
  const list: string[] = Array.isArray(cat)
    ? cat
    : typeof cat === 'string'
      ? cat.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  return list
    .map((c) => String(c).trim())
    .filter(Boolean)
    .map((c) => (c.startsWith('#') ? c : `#${c}`));
}

export class EventService {
  async getEvents(filters: GetEventsFilters) {
    const { timeframe = 'upcoming', category, city, calendarSlug, search, page, perPage } = filters;

    const now = new Date();
    const whereClause: any = {};

    // Timeframe filter
    if (timeframe === 'upcoming') {
      whereClause.endAt = { gte: now };
    } else if (timeframe === 'past') {
      whereClause.endAt = { lt: now };
    }

    // Category filter
    if (category && category !== 'All') {
      const cleanCat = category.replace(/^#/, '').trim();
      whereClause.category = {
        hasSome: [category, `#${cleanCat}`, cleanCat],
      };
    }

    // City filter
    if (city) {
      whereClause.city = { contains: city, mode: 'insensitive' };
    }

    // Calendar filter
    if (calendarSlug) {
      whereClause.calendar = { slug: calendarSlug };
    }

    // Search filter
    if (search) {
      const cleanSearch = search.startsWith('#') ? search.slice(1) : search;
      whereClause.OR = [
        { name: { contains: cleanSearch, mode: 'insensitive' } },
        { description: { contains: cleanSearch, mode: 'insensitive' } },
        { city: { contains: cleanSearch, mode: 'insensitive' } },
        { category: { hasSome: [search, `#${cleanSearch}`, cleanSearch] } },
        { address: { contains: cleanSearch, mode: 'insensitive' } },
      ];
    }

    const isPaginated = page && perPage && page > 0 && perPage > 0;
    const skip = isPaginated ? (page - 1) * perPage : undefined;
    const take = isPaginated ? perPage : undefined;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: whereClause,
        orderBy: {
          startAt: timeframe === 'past' ? 'desc' : 'asc',
        },
        skip,
        take,
        include: {
          host: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              username: true,
              bio: true,
              isVerified: true,
            },
          },
          calendar: {
            select: {
              id: true,
              slug: true,
              name: true,
              avatarUrl: true,
              tintColor: true,
            },
          },
          tickets: {
            select: {
              id: true,
              name: true,
              type: true,
              price: true,
              currency: true,
              capacity: true,
              requireApproval: true,
              saleStartAt: true,
              saleEndAt: true,
            },
          },
          merchandises: true,
          registrations: {
            where: { status: { in: ['APPROVED', 'CHECKED_IN'] } },
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      }),
      isPaginated ? prisma.event.count({ where: whereClause }) : Promise.resolve(0),
    ]);

    const meta = isPaginated
      ? {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      }
      : null;

    return { events, meta };
  }

  async getEventBySlug(slug: string) {
    if (!slug) {
      throw new AppError('Event slug is required', 400, 'VALIDATION_ERROR', {
        slug: ['Slug parameter is missing'],
      });
    }

    const targetSlug = slug === 'fzxb1tj6' ? 'radius-x-saladstop-goodness-in-motion' : slug;

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ slug: targetSlug }, { id: slug }],
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            bio: true,
            username: true,
            website: true,
            twitterHandle: true,
            instagramHandle: true,
            isVerified: true,
          },
        },
        calendar: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            avatarUrl: true,
            coverUrl: true,
            tintColor: true,
            subscriberCount: true,
          },
        },
        tickets: true,
        merchandises: true,
        registrations: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            name: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404, 'NOT_FOUND');
    }

    return event;
  }

  async createEvent(input: CreateEventInput) {
    const {
      name,
      slug,
      description,
      coverUrl,
      coverCardUrl,
      hostAvatarUrl,
      hostName,
      userId,
      startAt,
      endAt,
      timezone = 'Asia/Jakarta',
      locationType = 'offline',
      address,
      city,
      region,
      country,
      virtualUrl,
      requireApproval = false,
      maxCapacity,
      category = ['#Tech'],
      tintColor = '#2e72e0',
      hostEmail,
      calendarSlug,
      tickets = [],
    } = input;

    const validationErrors: Record<string, string[]> = {};
    if (!name) validationErrors.name = ['Name is required'];
    if (!startAt) validationErrors.startAt = ['Start time is required'];
    if (!endAt) validationErrors.endAt = ['End time is required'];

    if (Object.keys(validationErrors).length > 0) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', validationErrors);
    }

    // Generate unique slug if not provided
    const eventSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 6);

    // Find host by userId first, then by hostEmail
    let host = null;
    if (userId) {
      host = await prisma.user.findUnique({
        where: { id: userId },
      });
    }

    if (!host && hostEmail) {
      host = await prisma.user.findFirst({
        where: { email: hostEmail },
      });
    }

    if (!host) {
      const fallbackEmail =
        hostEmail ||
        (hostName
          ? `${hostName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}@helio.events`
          : `organizer_${Date.now()}@helio.events`);
      const fallbackName = hostName || 'Organizer';
      host = await prisma.user.create({
        data: {
          name: fallbackName,
          email: fallbackEmail,
          avatarUrl: hostAvatarUrl || 'https://cdn.lu.ma/avatars-default/avatar_24.png',
        },
      });
    } else if (hostAvatarUrl && host.avatarUrl !== hostAvatarUrl) {
      host = await prisma.user.update({
        where: { id: host.id },
        data: { avatarUrl: hostAvatarUrl },
      });
    }

    // Optional calendar resolution
    let calendarId: string | undefined = undefined;
    if (calendarSlug) {
      const cal = await prisma.calendar.findUnique({ where: { slug: calendarSlug } });
      if (cal) calendarId = cal.id;
    }

    // Default ticket if none provided
    const ticketData: NonNullable<CreateEventInput['tickets']> =
      tickets.length > 0
        ? tickets
        : [
          {
            name: 'General Admission',
            description: 'Standard event entry pass',
            type: 'free',
            price: 0,
            requireApproval,
            capacity: maxCapacity ? Number(maxCapacity) : undefined,
            currency: 'USD',
            saleStartAt: undefined,
            saleEndAt: undefined,
          },
        ];

    const newEvent = await prisma.event.create({
      data: {
        name,
        slug: eventSlug,
        description: description || '',
        coverUrl:
          coverUrl ||
          'https://images.lumacdn.com/uploads/ul/347bf4cf-3703-4559-9b27-c3ffc37e1dd7.png',
        coverCardUrl: coverCardUrl || null,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        timezone,
        locationType,
        address,
        city,
        region,
        country,
        virtualUrl,
        requireApproval,
        maxCapacity: maxCapacity ? Number(maxCapacity) : null,
        category: normalizeCategories(category),
        tintColor,
        font: input.font || 'sans',
        hostId: host.id,
        calendarId,
        tickets: {
          create: ticketData.map((t) => ({
            name: t.name || 'General Admission',
            description: t.description || null,
            type: t.type || 'free',
            price: Number(t.price) || 0,
            currency: t.currency || 'USD',
            capacity: t.capacity ? Number(t.capacity) : null,
            requireApproval: Boolean(t.requireApproval),
            saleStartAt: t.saleStartAt ? new Date(t.saleStartAt) : new Date(startAt),
            saleEndAt: t.saleEndAt ? new Date(t.saleEndAt) : new Date(endAt),
          })),
        },
        merchandises:
          input.merchandises && input.merchandises.length > 0
            ? {
              create: input.merchandises.map((m) => ({
                name: m.name,
                description: m.description || null,
                price: Number(m.price) || 0,
                currency: m.currency || 'IDR',
                imageUrl: m.imageUrl || null,
                stock: m.stock ? Number(m.stock) : null,
              })),
            }
            : undefined,
      },
      include: {
        host: true,
        calendar: true,
        tickets: true,
        merchandises: true,
      },
    });

    return newEvent;
  }

  async getEventGuests(eventId: string) {
    if (!eventId) {
      throw new AppError('Event ID is required', 400, 'VALIDATION_ERROR', {
        eventId: ['Event ID is missing'],
      });
    }

    const eventExists = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!eventExists) {
      throw new AppError('Event not found', 404, 'NOT_FOUND');
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      include: {
        ticket: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return registrations;
  }

  async updateEvent(slugOrId: string, input: Partial<CreateEventInput>, requesterUserId?: string) {
    if (!slugOrId) {
      throw new AppError('Event slug or ID is required', 400, 'VALIDATION_ERROR', {
        slug: ['Slug or ID parameter is missing'],
      });
    }

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        tickets: true,
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404, 'NOT_FOUND');
    }

    // Check ownership if requester is provided
    if (requesterUserId && event.hostId !== requesterUserId) {
      throw new AppError('You are not authorized to edit this event', 403, 'FORBIDDEN');
    }

    // Check if event is ongoing
    const now = new Date();
    const isOngoing = now >= event.startAt && now <= event.endAt;
    if (isOngoing) {
      throw new AppError('Cannot edit an ongoing event', 400, 'EVENT_ONGOING');
    }

    const {
      name,
      description,
      coverUrl,
      coverCardUrl,
      startAt,
      endAt,
      timezone,
      locationType,
      address,
      city,
      region,
      country,
      virtualUrl,
      requireApproval,
      maxCapacity,
      category,
      tintColor,
      font,
      calendarSlug,
      tickets,
    } = input;

    let calendarId = event.calendarId;
    if (calendarSlug !== undefined) {
      if (calendarSlug) {
        const cal = await prisma.calendar.findUnique({ where: { slug: calendarSlug } });
        calendarId = cal ? cal.id : null;
      } else {
        calendarId = null;
      }
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (description !== undefined) updatedData.description = description;
    if (coverUrl !== undefined) updatedData.coverUrl = coverUrl;
    if (coverCardUrl !== undefined) updatedData.coverCardUrl = coverCardUrl;
    if (startAt !== undefined) updatedData.startAt = new Date(startAt);
    if (endAt !== undefined) updatedData.endAt = new Date(endAt);
    if (timezone !== undefined) updatedData.timezone = timezone;
    if (locationType !== undefined) updatedData.locationType = locationType;
    if (address !== undefined) updatedData.address = address;
    if (city !== undefined) updatedData.city = city;
    if (region !== undefined) updatedData.region = region;
    if (country !== undefined) updatedData.country = country;
    if (virtualUrl !== undefined) updatedData.virtualUrl = virtualUrl;
    if (requireApproval !== undefined) updatedData.requireApproval = requireApproval;
    if (maxCapacity !== undefined) updatedData.maxCapacity = maxCapacity ? Number(maxCapacity) : null;
    if (category !== undefined) updatedData.category = normalizeCategories(category);
    if (tintColor !== undefined) updatedData.tintColor = tintColor;
    if (font !== undefined) updatedData.font = font;
    if (calendarSlug !== undefined) updatedData.calendarId = calendarId;

    // Handle ticket updates if provided
    if (tickets && tickets.length > 0) {
      await prisma.ticket.deleteMany({
        where: { eventId: event.id },
      });
      await prisma.ticket.createMany({
        data: tickets.map((t) => ({
          eventId: event.id,
          name: t.name || 'General Admission',
          description: t.description || null,
          type: t.type || 'free',
          price: Number(t.price) || 0,
          currency: t.currency || 'IDR',
          capacity: t.capacity ? Number(t.capacity) : null,
          requireApproval: Boolean(t.requireApproval),
          saleStartAt: t.saleStartAt ? new Date(t.saleStartAt) : (startAt ? new Date(startAt) : event.startAt),
          saleEndAt: t.saleEndAt ? new Date(t.saleEndAt) : (endAt ? new Date(endAt) : event.endAt),
        })),
      });
    }

    // Handle merchandise updates if provided
    if (input.merchandises !== undefined) {
      await prisma.merchandise.deleteMany({
        where: { eventId: event.id },
      });
      if (input.merchandises.length > 0) {
        await prisma.merchandise.createMany({
          data: input.merchandises.map((m) => ({
            eventId: event.id,
            name: m.name,
            description: m.description || null,
            price: Number(m.price) || 0,
            currency: m.currency || 'IDR',
            imageUrl: m.imageUrl || null,
            stock: m.stock ? Number(m.stock) : null,
          })),
        });
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: updatedData,
      include: {
        host: true,
        calendar: true,
        tickets: true,
        merchandises: true,
      },
    });

    return updatedEvent;
  }
}

export const eventService = new EventService();
