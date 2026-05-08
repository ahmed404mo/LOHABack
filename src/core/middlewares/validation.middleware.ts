import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import ApiError from '../utils/api-error';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return next(new ApiError('Validation error', 400, errors));
    }
    next();
  };
};