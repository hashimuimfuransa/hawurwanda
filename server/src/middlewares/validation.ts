import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message),
      });
      return;
    }
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query);
    if (error) {
      res.status(400).json({
        message: 'Query validation error',
        details: error.details.map(detail => detail.message),
      });
      return;
    }
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params);
    if (error) {
      res.status(400).json({
        message: 'Parameter validation error',
        details: error.details.map(detail => detail.message),
      });
      return;
    }
    next();
  };
};
