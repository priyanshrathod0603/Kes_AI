import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2003': // Foreign key constraint failed
        return res.status(400).json({
          success: false,
          message: 'Invalid reference: related record does not exist',
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          success: false,
          message: 'Record not found',
        });
      case 'P2002': // Unique constraint failed
        return res.status(409).json({
          success: false,
          message: 'A record with this value already exists',
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Database error: ${err.message}`,
        });
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided',
    });
  }

  // Handle Zod validation errors (thrown by validate middleware)
  if (err.name === 'ZodError') {
    const errors = err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return res.status(400).json({
      success: false,
      message: `Validation failed: ${errors}`,
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    success: false,
    message,
  });
};
