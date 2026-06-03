"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOnlineUser = addOnlineUser;
exports.removeOnlineUser = removeOnlineUser;
exports.isUserOnline = isUserOnline;
exports.getOnlineUserIds = getOnlineUserIds;
const onlineUsers = new Map();
function addOnlineUser(userId, socketId) {
    onlineUsers.set(userId, socketId);
}
function removeOnlineUser(userId) {
    onlineUsers.delete(userId);
}
function isUserOnline(userId) {
    return onlineUsers.has(userId);
}
function getOnlineUserIds() {
    return Array.from(onlineUsers.keys());
}
