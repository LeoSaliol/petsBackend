"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadMessagesCountController = exports.markConversationAsReadController = exports.sendMessageController = exports.deleteConversationController = exports.getConversationByIdController = exports.createConversation = exports.getConversations = void 0;
const conversation_service_1 = require("../services/conversation.service");
const getConversations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const conversations = await (0, conversation_service_1.getUserConversations)(userId);
        res.json({ success: true, data: conversations });
    }
    catch (error) {
        next(error);
    }
};
exports.getConversations = getConversations;
const createConversation = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { petId } = req.body;
        if (!petId) {
            return res.status(400).json({ message: 'petId is required' });
        }
        const conversation = await (0, conversation_service_1.createOrGetConversation)(userId, Number(petId));
        res.json({ success: true, id: conversation.id });
    }
    catch (error) {
        next(error);
    }
};
exports.createConversation = createConversation;
const getConversationByIdController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const conversationId = parseInt(req.params.id);
        const page = Number(req.query.page) || 1;
        const messages = await (0, conversation_service_1.getConversationById)(conversationId, userId, page);
        res.json({ success: true, data: messages });
    }
    catch (error) {
        next(error);
    }
};
exports.getConversationByIdController = getConversationByIdController;
const deleteConversationController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const conversationId = parseInt(req.params.id);
        await (0, conversation_service_1.deleteConversation)(conversationId, userId);
        res.json({ success: true, message: 'Conversación eliminada' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteConversationController = deleteConversationController;
const sendMessageController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const conversationId = parseInt(req.params.id);
        const content = req.body.content;
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }
        const message = await (0, conversation_service_1.sendMessage)(conversationId, userId, content);
        res.json({ success: true, data: message });
    }
    catch (error) {
        next(error);
    }
};
exports.sendMessageController = sendMessageController;
const markConversationAsReadController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const conversationId = parseInt(req.params.id);
        await (0, conversation_service_1.markConversationAsRead)(conversationId, userId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
};
exports.markConversationAsReadController = markConversationAsReadController;
const getUnreadMessagesCountController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const count = await (0, conversation_service_1.getUnreadMessagesCount)(userId);
        res.json({ success: true, data: count });
    }
    catch (error) {
        next(error);
    }
};
exports.getUnreadMessagesCountController = getUnreadMessagesCountController;
