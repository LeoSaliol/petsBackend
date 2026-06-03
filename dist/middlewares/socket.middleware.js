"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySocketAuthMiddleware = applySocketAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_1 = require("cookie");
function applySocketAuthMiddleware(io) {
    io.use((socket, next) => {
        let userId = socket.handshake.auth.userId;
        if (!userId) {
            const cookieHeader = socket.handshake.headers.cookie;
            const cookies = (0, cookie_1.parse)(cookieHeader || '');
            const token = cookies['accessToken'];
            if (!token) {
                return next(new Error('Authentication error: Token is required'));
            }
            try {
                const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                userId = payload.userId;
            }
            catch (error) {
                return next(new Error('Authentication error: Invalid token'));
            }
        }
        socket.handshake.auth.userId = userId;
        next();
    });
}
