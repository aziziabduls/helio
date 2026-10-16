import { Request, Response } from 'express';
import { eventService } from '../services/event.service';
import { sendSuccess, sendError, AppError } from '../utils/response';

export class EventController {
  async getEvents(req: Request, res: Response) {
    try {
      const { timeframe, category, city, calendarSlug, search, page, perPage } = req.query;

      const result = await eventService.getEvents({
        timeframe: typeof timeframe === 'string' ? timeframe : undefined,
        category: typeof category === 'string' ? category : undefined,
        city: typeof city === 'string' ? city : undefined,
        calendarSlug: typeof calendarSlug === 'string' ? calendarSlug : undefined,
        search: typeof search === 'string' ? search : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        perPage: perPage ? parseInt(perPage as string, 10) : undefined,
      });

      return sendSuccess(res, 'Events retrieved successfully', result.events, 200, result.meta);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to fetch events', 500, 'SERVER_ERROR');
    }
  }

  async getEventBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const event = await eventService.getEventBySlug(slug);
      return sendSuccess(res, 'Event details retrieved successfully', event);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to fetch event details', 500, 'SERVER_ERROR');
    }
  }

  async createEvent(req: Request, res: Response) {
    try {
      const hostEmail = req.user?.email || req.body.hostEmail;
      const userId = req.user?.userId || req.body.userId;
      const hostName = req.body.hostName;
      const newEvent = await eventService.createEvent({
        ...req.body,
        hostEmail,
        userId,
        hostName,
      });
      return sendSuccess(res, 'Event created successfully', newEvent, 201);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to create event', 500, 'SERVER_ERROR');
    }
  }

  async getEventGuests(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const guests = await eventService.getEventGuests(id);
      return sendSuccess(res, 'Guest list retrieved successfully', guests);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to fetch guest list', 500, 'SERVER_ERROR');
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const requesterUserId = req.user?.userId;
      const updatedEvent = await eventService.updateEvent(slug, req.body, requesterUserId);
      return sendSuccess(res, 'Event updated successfully', updatedEvent);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to update event', 500, 'SERVER_ERROR');
    }
  }
}

export const eventController = new EventController();
