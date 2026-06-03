import { NextFunction, Request, Response } from 'express';
import {
    getConversationById,
    getPetConversations,
    deleteConversation,
    createOrGetConversation,
    sendMessage,
    getUnreadMessagesCount,
    markConversationAsRead,
} from '../services/conversation.service';

export const getConversations = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = req.petId;
        if (!petId) {
            return res.json({ success: true, data: [] });
        }
        const conversations = await getPetConversations(petId);
        res.json({ success: true, data: conversations });
    } catch (error) {
        next(error);
    }
};

export const createConversation = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const currentPetId = req.petId;
        if (!currentPetId) {
            return res.status(400).json({ message: 'No pet selected' });
        }
        const { petId: targetPetId } = req.body;

        if (!targetPetId) {
            return res.status(400).json({ message: 'petId is required' });
        }

        const conversation = await createOrGetConversation(currentPetId, Number(targetPetId));
        res.json({ success: true, id: conversation.id });
    } catch (error: any) {
        next(error);
    }
};

export const getConversationByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = req.petId;
        if (!petId) {
            return res.status(400).json({ message: 'No pet selected' });
        }
        const conversationId = parseInt(req.params.id);
        const page = Number(req.query.page as string) || 1;
        const messages = await getConversationById(
            conversationId,
            petId,
            page,
        );
        res.json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};

export const deleteConversationController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = req.petId;
        if (!petId) {
            return res.status(400).json({ message: 'No pet selected' });
        }
        const conversationId = parseInt(req.params.id);
        await deleteConversation(conversationId, petId);
        res.json({ success: true, message: 'Conversación eliminada' });
    } catch (error) {
        next(error);
    }
};

export const sendMessageController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = req.petId;
        if (!petId) {
            return res.status(400).json({ message: 'No pet selected' });
        }
        const conversationId = parseInt(req.params.id);
        const content = req.body.content;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const message = await sendMessage(conversationId, petId, content);
        res.json({ success: true, data: message });
    } catch (error: any) {
        next(error);
    }
};

export const markConversationAsReadController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = req.petId;
        if (!petId) {
            return res.status(400).json({ message: 'No pet selected' });
        }
        const conversationId = parseInt(req.params.id);
        await markConversationAsRead(conversationId, petId);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const getUnreadMessagesCountController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const petId = req.petId;
        if (!petId) {
            return res.json({ success: true, data: 0 });
        }
        const count = await getUnreadMessagesCount(petId);
        res.json({ success: true, data: count });
    } catch (error) {
        next(error);
    }
};
