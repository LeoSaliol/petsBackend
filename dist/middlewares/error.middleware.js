"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMidleware = void 0;
const errorMidleware = (err, req, res, next) => {
    console.log(err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        succes: false,
        message,
    });
};
exports.errorMidleware = errorMidleware;
