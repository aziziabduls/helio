import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess, sendError, AppError } from '../utils/response';

export class UserController {
  async getCurrentUser(_req: Request, res: Response) {
    try {
      const user = await userService.getCurrentUser();
      return sendSuccess(res, 'Current user retrieved successfully', user);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to fetch current user', 500, 'SERVER_ERROR');
    }
  }

  async getUserByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const user = await userService.getUserByUsername(username);
      return sendSuccess(res, 'User profile retrieved successfully', user);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to fetch user profile', 500, 'SERVER_ERROR');
    }
  }
}

export const userController = new UserController();
