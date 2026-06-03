"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.byPost = exports.create = void 0;
const comment_services_1 = require("../services/comment.services");
const create = async (req, res, next) => {
    try {
        const postId = Number(req.params.postId);
        const { content } = req.body;
        const petId = req.petId;
        if (!content) {
            return res.status(400).json({ message: 'Content required' });
        }
        const comment = await (0, comment_services_1.createComment)(petId, postId, content);
        res.status(201).json(comment);
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const byPost = async (req, res, next) => {
    try {
        const postId = Number(req.params.postId);
        const comments = await (0, comment_services_1.getCommentsByPost)(postId);
        res.json(comments);
    }
    catch (error) {
        next(error);
    }
};
exports.byPost = byPost;
