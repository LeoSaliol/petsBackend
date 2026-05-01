import { NextFunction, Request, Response } from 'express';
import {
    getConversationById,
    getUserConversations,
} from '../services/conversation.service';
import { success } from 'zod';

export const getConversations = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user!.id;
        const conversations = await getUserConversations(userId);
        res.json({ success: true, data: conversations });
    } catch (error) {
        next(error);
    }
};

export const getConversationByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user!.id;
        const conversationId = parseInt(req.params.id);
        const page = Number(req.query.page as string) || 1;
        const messages = await getConversationById(
            conversationId,
            userId,
            page,
        );
        res.json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};
