import { NextFunction, Request, Response } from 'express';

export const errorMidleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.log(err);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        succes: false,
        message,
    });
};
