import { prisma } from '../db';
import { AppError } from '../utils/response';

export class UserService {
  async getCurrentUser() {
    const user = await prisma.user.findFirst({
      where: { email: 'alexa@agihouse.org' },
      include: {
        events: {
          take: 5,
          orderBy: { startAt: 'desc' },
        },
        calendars: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    return user;
  }

  async getUserByUsername(username: string) {
    if (!username) {
      throw new AppError('Username is required', 400, 'VALIDATION_ERROR', {
        username: ['Username parameter is missing'],
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { username: username.toLowerCase() },
          { id: username },
        ],
      },
      include: {
        events: {
          orderBy: { startAt: 'desc' },
          include: {
            tickets: true,
            calendar: { select: { id: true, name: true, slug: true } },
            _count: { select: { registrations: true } },
          },
        },
        calendars: true,
        registrations: {
          include: {
            event: {
              include: {
                tickets: true,
                calendar: { select: { id: true, name: true, slug: true } },
                _count: { select: { registrations: true } },
              },
            },
          },
        },
        _count: {
          select: {
            events: true,
            registrations: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    return user;
  }
}

export const userService = new UserService();
