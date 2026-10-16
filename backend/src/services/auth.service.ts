import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { AppError } from '../utils/response';

export interface SignupInput {
  name: string;
  email: string;
  password?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  twitterHandle?: string;
  instagramHandle?: string;
}

export class AuthService {
  private getJwtSecret(): string {
    return process.env.JWT_SECRET || 'helio_super_secret_jwt_key_2026_dev';
  }

  private getJwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '7d';
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, this.getJwtSecret(), {
      expiresIn: this.getJwtExpiresIn() as any,
    });
  }

  private sanitizeUser(user: any) {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  async signup(input: SignupInput) {
    const { name, email, password, username, bio, avatarUrl } = input;

    const validationErrors: Record<string, string[]> = {};
    if (!name || !name.trim()) validationErrors.name = ['Full name is required'];
    if (!email || !email.trim()) validationErrors.email = ['Valid email is required'];
    if (!password || password.length < 6) {
      validationErrors.password = ['Password must be at least 6 characters'];
    }

    if (Object.keys(validationErrors).length > 0) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', validationErrors);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing email
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      throw new AppError('An account with this email already exists', 409, 'CONFLICT', {
        email: ['Email is already in use'],
      });
    }

    // Generate or validate username
    const baseUsername =
      username?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 15) ||
      'user';

    let finalUsername = baseUsername;
    const existingUsername = await prisma.user.findUnique({
      where: { username: finalUsername },
    });
    if (existingUsername) {
      finalUsername = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password!, 10);

    const defaultAvatar =
      avatarUrl ||
      `https://images.lumacdn.com/avatars/7l/7860ba89-4a48-4147-9d29-2fd0ac9a724f.png`;

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        username: finalUsername,
        bio: bio?.trim() || null,
        avatarUrl: defaultAvatar,
        isVerified: false,
      },
    });

    const token = this.generateToken(newUser.id, newUser.email);

    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  async login(input: LoginInput) {
    const { email, password } = input;

    const validationErrors: Record<string, string[]> = {};
    if (!email || !email.trim()) validationErrors.email = ['Email is required'];
    if (!password) validationErrors.password = ['Password is required'];

    if (Object.keys(validationErrors).length > 0) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', validationErrors);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    // If user has no password set (e.g. seeded demo user), check demo fallback or reject
    if (!user.password) {
      // Demo password support for seeded users: "password123"
      if (password === 'password123') {
        const token = this.generateToken(user.id, user.email);
        return {
          user: this.sanitizeUser(user),
          token,
        };
      }
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const isMatch = await bcrypt.compare(password!, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getCurrentUser(userId: string) {
    if (!userId) {
      throw new AppError('User ID is required', 400, 'VALIDATION_ERROR');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        events: {
          orderBy: { startAt: 'desc' },
          include: {
            tickets: true,
            _count: { select: { registrations: true } },
          },
        },
        calendars: {
          orderBy: { subscriberCount: 'desc' },
        },
        registrations: {
          orderBy: { createdAt: 'desc' },
          include: {
            event: {
              select: {
                id: true,
                name: true,
                slug: true,
                coverUrl: true,
                startAt: true,
                endAt: true,
                locationType: true,
                address: true,
                city: true,
                category: true,
              },
            },
            ticket: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User profile not found', 404, 'NOT_FOUND');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    if (!userId) {
      throw new AppError('User ID is required', 400, 'VALIDATION_ERROR');
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name !== undefined ? input.name : undefined,
        bio: input.bio !== undefined ? input.bio : undefined,
        avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : undefined,
        website: input.website !== undefined ? input.website : undefined,
        twitterHandle: input.twitterHandle !== undefined ? input.twitterHandle : undefined,
        instagramHandle: input.instagramHandle !== undefined ? input.instagramHandle : undefined,
      },
    });

    return this.sanitizeUser(updated);
  }
}

export const authService = new AuthService();
