import mongoose from 'mongoose';
import { Request, Response } from 'express';

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Middleware to validate ObjectId parameters in route params
 */
export const validateObjectIdParam = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: Function) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({ 
        message: `${paramName} parameter is required` 
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: `Invalid ${paramName} format. Must be a valid MongoDB ObjectId.` 
      });
    }

    next();
  };
};

/**
 * Validates multiple ObjectId fields in request body
 */
export const validateObjectIdFields = (fields: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    for (const field of fields) {
      const value = req.body[field];
      
      // Only validate if field exists and is not empty
      if (value && !isValidObjectId(value)) {
        return res.status(400).json({
          message: `Invalid ${field} format. Must be a valid MongoDB ObjectId.`
        });
      }
    }
    
    next();
  };
};

/**
 * Utility function to safely convert string to ObjectId
 */
export const toObjectId = (id: string): mongoose.Types.ObjectId | null => {
  if (!isValidObjectId(id)) {
    return null;
  }
  return new mongoose.Types.ObjectId(id);
};

/**
 * Generic error handler for invalid ObjectId errors
 */
export const handleInvalidObjectIdError = (error: any, req: Request, res: Response, next: Function) => {
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).json({
      message: `Invalid ${error.path} format. Must be a valid MongoDB ObjectId.`,
      path: error.path,
      value: error.value
    });
  }
  next(error);
};