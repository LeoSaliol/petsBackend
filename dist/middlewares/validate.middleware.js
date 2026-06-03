"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const httpError_1 = require("../utils/httpError");
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (error) {
        next(new httpError_1.HttpError(error.errors[0].message, 400));
    }
};
exports.validate = validate;
