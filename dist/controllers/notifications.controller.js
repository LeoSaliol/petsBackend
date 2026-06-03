"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.readAllNotifications = exports.readNotification = exports.getNotifications = void 0;
const notificationService = __importStar(require("../services/notifications.services"));
const getNotifications = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.petId);
        const limit = req.query.limit
            ? parseInt(String(req.query.limit))
            : undefined;
        const notifications = await notificationService.getUserNotifications(userId, limit);
        res.json({
            success: true,
            data: notifications,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getNotifications = getNotifications;
const readNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.markAsRead(id);
        res.json({
            success: true,
            data: notification,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.readNotification = readNotification;
const readAllNotifications = async (req, res, next) => {
    try {
        const petId = parseInt(req.params.petId);
        const result = await notificationService.markAllAsRead(petId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.readAllNotifications = readAllNotifications;
const getUnreadCount = async (req, res, next) => {
    try {
        const petId = parseInt(req.params.petId);
        const count = await notificationService.getUnreadNotificationsCount(petId);
        res.json({ success: true, data: count });
    }
    catch (error) {
        next(error);
    }
};
exports.getUnreadCount = getUnreadCount;
