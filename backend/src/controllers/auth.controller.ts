import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError, AppError } from '../utils/response';

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const result = await authService.signup(req.body);
      return sendSuccess(res, 'Account created successfully', result, 201);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to sign up', 500, 'SERVER_ERROR');
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, 'Logged in successfully', result);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to log in', 500, 'SERVER_ERROR');
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
      }

      const user = await authService.getCurrentUser(req.user.userId);
      return sendSuccess(res, 'User profile retrieved successfully', user);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to fetch user profile', 500, 'SERVER_ERROR');
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
      }

      const updatedUser = await authService.updateProfile(req.user.userId, req.body);
      return sendSuccess(res, 'Profile updated successfully', updatedUser);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to update profile', 500, 'SERVER_ERROR');
    }
  }
}

export const authController = new AuthController();
