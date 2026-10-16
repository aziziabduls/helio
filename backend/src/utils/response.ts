import { Response } from 'express';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'EVENT_ONGOING';

export interface MetaData {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  meta: MetaData | null;
  error: null | {
    code: ErrorCode;
    errors?: Record<string, string[]>;
  };
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: ErrorCode = 'VALIDATION_ERROR',
    public errors?: Record<string, string[]>
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function sendSuccess<T>(
  res: Response,
  message: string,
  data: T,
  statusCode: number = 200,
  meta: MetaData | null = null
): Response {
  const responseBody: StandardResponse<T> = {
    success: true,
    message,
    data,
    meta,
    error: null,
  };
  return res.status(statusCode).json(responseBody);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  code: ErrorCode = 'SERVER_ERROR',
  errors?: Record<string, string[]>
): Response {
  const responseBody: StandardResponse<null> = {
    success: false,
    message,
    data: null,
    meta: null,
    error: {
      code,
      ...(errors ? { errors } : {}),
    },
  };
  return res.status(statusCode).json(responseBody);
}
