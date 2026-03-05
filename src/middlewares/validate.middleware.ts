import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { HttpError } from '../utils/httpError';

export const validate =
    (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error: any) {
            next(new HttpError(error.errors[0].message, 400));
        }
    };
