import { prisma } from '../db';
import { AppError } from '../utils/response';
import QRCode from 'qrcode';
import { randomUUID } from 'crypto';

export interface RegisterInput {
  name: string;
  email: string;
  ticketId?: string;
  notes?: string;
  answers?: any;
}

export class RegistrationService {
  async register(eventId: string, input: RegisterInput) {
    const { name, email, ticketId, notes, answers } = input;

    const validationErrors: Record<string, string[]> = {};
    if (!name) validationErrors.name = ['Name is required'];
    if (!email) validationErrors.email = ['Email is required'];

    if (Object.keys(validationErrors).length > 0) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', validationErrors);
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tickets: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404, 'NOT_FOUND');
    }

    // Check if event has ended
    if (event.endAt && new Date() > new Date(event.endAt)) {
      throw new AppError('This event has already ended. Registrations are closed.', 400, 'EVENT_ENDED');
    }

    // Check capacity
    if (event.maxCapacity && event._count.registrations >= event.maxCapacity) {
      throw new AppError('Event is at full capacity', 409, 'CONFLICT');
    }

    // Select ticket
    const selectedTicket = ticketId
      ? event.tickets.find((t) => t.id === ticketId)
      : event.tickets[0];

    const needsApproval = selectedTicket?.requireApproval ?? event.requireApproval;
    const status = needsApproval ? 'PENDING' : 'APPROVED';
    const ticketKey = 'tkt-' + randomUUID();

    // Generate QR Code data URL
    const qrPayload = JSON.stringify({
      ticketKey,
      eventId: event.id,
      eventName: event.name,
      guestName: name,
      guestEmail: email,
      status,
    });
    const qrCode = await QRCode.toDataURL(qrPayload);

    // Resolve userId if user is registered/logged in
    let resolvedUserId = (input as any).userId;
    if (!resolvedUserId) {
      const existingUser = await prisma.user.findFirst({
        where: { email },
        select: { id: true },
      });
      if (existingUser) resolvedUserId = existingUser.id;
    }

    // Save registration
    const registration = await prisma.registration.create({
      data: {
        eventId: event.id,
        ticketId: selectedTicket?.id,
        userId: resolvedUserId || null,
        name,
        email,
        status,
        ticketKey,
        qrCode,
        notes,
        answers: answers ? JSON.stringify(answers) : null,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            startAt: true,
            endAt: true,
            address: true,
            city: true,
          },
        },
        ticket: true,
      },
    });

    return registration;
  }

  async getTicketByKey(ticketKey: string) {
    if (!ticketKey) {
      throw new AppError('Ticket key is required', 400, 'VALIDATION_ERROR', {
        ticketKey: ['Ticket key is missing'],
      });
    }

    const registration = await prisma.registration.findUnique({
      where: { ticketKey },
      include: {
        event: {
          include: {
            host: true,
          },
        },
        ticket: true,
      },
    });

    if (!registration) {
      throw new AppError('Ticket not found', 404, 'NOT_FOUND');
    }

    return registration;
  }

  async updateStatus(id: string, status: string) {
    if (!['APPROVED', 'PENDING', 'REJECTED', 'CHECKED_IN'].includes(status)) {
      throw new AppError(
        'Invalid status. Allowed values: APPROVED, PENDING, REJECTED, CHECKED_IN',
        400,
        'VALIDATION_ERROR',
        { status: ['Invalid status value'] }
      );
    }

    const exists = await prisma.registration.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new AppError('Registration not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: { status: status as any },
      include: {
        ticket: true,
      },
    });

    return updated;
  }
}

export const registrationService = new RegistrationService();
