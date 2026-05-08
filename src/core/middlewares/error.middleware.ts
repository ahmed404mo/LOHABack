import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';

export const errorMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Prisma errors
  if (err.name === 'PrismaClientValidationError') {
    return ApiResponse.error(res, 'Invalid data provided', 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token expired', 401);
  }

  // Default error
  return ApiResponse.error(res, 'Internal server error', 500);
};