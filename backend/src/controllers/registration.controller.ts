import { Request, Response } from 'express';
import { registrationService } from '../services/registration.service';
import { sendSuccess, sendError, AppError } from '../utils/response';

export class RegistrationController {
  async register(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const registration = await registrationService.register(id, req.body);
      return sendSuccess(res, 'Registration completed successfully', registration, 201);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to complete registration', 500, 'SERVER_ERROR');
    }
  }

  async getTicket(req: Request, res: Response) {
    try {
      const { ticketKey } = req.params;
      const ticket = await registrationService.getTicketByKey(ticketKey);
      return sendSuccess(res, 'Ticket details retrieved successfully', ticket);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to fetch ticket', 500, 'SERVER_ERROR');
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await registrationService.updateStatus(id, status);
      return sendSuccess(res, 'Registration status updated successfully', updated);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to update registration status', 500, 'SERVER_ERROR');
    }
  }
}

export const registrationController = new RegistrationController();
