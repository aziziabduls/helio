import { prisma } from '../db';
import { AppError } from '../utils/response';

export class CalendarService {
  async getCalendars() {
    const calendars = await prisma.calendar.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: {
        subscriberCount: 'desc',
      },
    });

    return calendars;
  }

  async getCalendarBySlug(slug: string) {
    if (!slug) {
      throw new AppError('Calendar slug is required', 400, 'VALIDATION_ERROR', {
        slug: ['Slug parameter is missing'],
      });
    }

    const calendar = await prisma.calendar.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            username: true,
            isVerified: true,
          },
        },
        events: {
          orderBy: {
            startAt: 'asc',
          },
          include: {
            host: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            tickets: true,
            _count: {
              select: {
                registrations: true,
              },
            },
          },
        },
      },
    });

    if (!calendar) {
      throw new AppError('Calendar not found', 404, 'NOT_FOUND');
    }

    return calendar;
  }

  async createCalendar(input: {
    name: string;
    slug?: string;
    description?: string;
    avatarUrl?: string;
    coverUrl?: string;
    tintColor?: string;
    ownerId?: string;
    ownerEmail?: string;
  }) {
    const { name, slug, description, avatarUrl, coverUrl, tintColor, ownerId, ownerEmail } = input;

    if (!name) {
      throw new AppError('Calendar name is required', 400, 'VALIDATION_ERROR', {
        name: ['Name is required'],
      });
    }

    let owner = null;
    if (ownerId) {
      owner = await prisma.user.findUnique({ where: { id: ownerId } });
    }
    if (!owner && ownerEmail) {
      owner = await prisma.user.findFirst({ where: { email: ownerEmail } });
    }
    if (!owner) {
      owner = await prisma.user.findFirst();
    }
    if (!owner) {
      owner = await prisma.user.create({
        data: {
          name: 'Calendar Owner',
          email: ownerEmail || `owner_${Date.now()}@helio.events`,
          avatarUrl: avatarUrl || 'https://cdn.lu.ma/avatars-default/avatar_12.png',
        },
      });
    }

    const calendarSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 6);

    const newCalendar = await prisma.calendar.create({
      data: {
        name,
        slug: calendarSlug,
        description: description || null,
        avatarUrl: avatarUrl || 'https://cdn.lu.ma/avatars-default/avatar_12.png',
        coverUrl: coverUrl || null,
        tintColor: tintColor || '#2e72e0',
        ownerId: owner.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return newCalendar;
  }

  async updateCalendar(
    slug: string,
    input: {
      name?: string;
      slug?: string;
      description?: string;
      avatarUrl?: string;
      coverUrl?: string;
      tintColor?: string;
    },
    requesterUserId?: string
  ) {
    if (!slug) {
      throw new AppError('Calendar slug is required', 400, 'VALIDATION_ERROR');
    }

    const calendar = await prisma.calendar.findUnique({
      where: { slug },
      include: { owner: true },
    });

    if (!calendar) {
      throw new AppError('Calendar not found', 404, 'NOT_FOUND');
    }

    if (requesterUserId && calendar.ownerId !== requesterUserId) {
      throw new AppError('You do not have permission to edit this calendar', 403, 'FORBIDDEN');
    }

    const { name, slug: newSlug, description, avatarUrl, coverUrl, tintColor } = input;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description || null;
    if (avatarUrl !== undefined) dataToUpdate.avatarUrl = avatarUrl || null;
    if (coverUrl !== undefined) dataToUpdate.coverUrl = coverUrl || null;
    if (tintColor !== undefined) dataToUpdate.tintColor = tintColor;

    if (newSlug && newSlug !== calendar.slug) {
      const existing = await prisma.calendar.findUnique({ where: { slug: newSlug } });
      if (existing) {
        throw new AppError('Calendar URL handle already taken', 400, 'CONFLICT');
      }
      dataToUpdate.slug = newSlug;
    }

    const updated = await prisma.calendar.update({
      where: { id: calendar.id },
      data: dataToUpdate,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            username: true,
            isVerified: true,
          },
        },
      },
    });

    return updated;
  }
}

export const calendarService = new CalendarService();
