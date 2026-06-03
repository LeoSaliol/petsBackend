"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const socket_middleware_1 = require("./middlewares/socket.middleware");
const chatHandler_1 = require("./sockets/chatHandler");
const onlineUser_1 = require("./sockets/onlineUser");
const prisma_1 = require("./config/prisma");
const PORT = process.env.PORT || 2000;
const server = http_1.default.createServer(app_1.default);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
});
(0, socket_middleware_1.applySocketAuthMiddleware)(exports.io);
exports.io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    socket.data.userId = userId;
    (0, onlineUser_1.addOnlineUser)(userId, socket.id);
    console.log('🟢 Usuario conectado', userId);
    socket.join(String(userId));
    exports.io.emit('userOnline', { userId });
    socket.on('getOnlineUsers', () => {
        const { getOnlineUserIds } = require('./sockets/onlineUser');
        socket.emit('onlineUsers', { userIds: getOnlineUserIds() });
    });
    (0, chatHandler_1.handleChatEvents)(socket, exports.io);
    socket.on('disconnect', async () => {
        (0, onlineUser_1.removeOnlineUser)(userId);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { lastSeen: new Date() },
        });
        exports.io.emit('userOffline', { userId });
        console.log('🔴 Usuario desconectado', userId);
    });
});
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
