import { Request, Response } from 'express';
import { calendarService } from '../services/calendar.service';
import { sendSuccess, sendError, AppError } from '../utils/response';

export class CalendarController {
  async getCalendars(_req: Request, res: Response) {
    try {
      const calendars = await calendarService.getCalendars();
      return sendSuccess(res, 'Calendars retrieved successfully', calendars);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to fetch calendars', 500, 'SERVER_ERROR');
    }
  }

  async getCalendarBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const calendar = await calendarService.getCalendarBySlug(slug);
      return sendSuccess(res, 'Calendar details retrieved successfully', calendar);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to fetch calendar details', 500, 'SERVER_ERROR');
    }
  }

  async createCalendar(req: Request, res: Response) {
    try {
      const ownerId = req.user?.userId;
      const ownerEmail = req.user?.email;
      const calendar = await calendarService.createCalendar({
        ...req.body,
        ownerId,
        ownerEmail,
      });
      return sendSuccess(res, 'Calendar created successfully', calendar, 201);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to create calendar', 500, 'SERVER_ERROR');
    }
  }

  async updateCalendar(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const requesterUserId = req.user?.userId;
      const calendar = await calendarService.updateCalendar(slug, req.body, requesterUserId);
      return sendSuccess(res, 'Calendar updated successfully', calendar);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to update calendar', 500, 'SERVER_ERROR');
    }
  }
}

export const calendarController = new CalendarController();
