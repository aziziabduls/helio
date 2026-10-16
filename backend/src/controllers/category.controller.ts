import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { sendSuccess, sendError, AppError } from '../utils/response';

export class CategoryController {
  async getCategories(_req: Request, res: Response) {
    try {
      const categories = await categoryService.getCategories();
      return sendSuccess(res, 'Categories retrieved successfully', categories);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to fetch categories', 500, 'SERVER_ERROR');
    }
  }

  async getCities(_req: Request, res: Response) {
    try {
      const cities = await categoryService.getCities();
      return sendSuccess(res, 'Cities retrieved successfully', cities);
    } catch (error: any) {
      if (error instanceof AppError) {
        return sendError(res, error.message, error.statusCode, error.code, error.errors);
      }
      return sendError(res, error.message || 'Failed to fetch cities', 500, 'SERVER_ERROR');
    }
  }
}

export const categoryController = new CategoryController();
