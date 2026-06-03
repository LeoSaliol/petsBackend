"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.byPost = exports.toggle = void 0;
const like_services_1 = require("../services/like.services");
const toggle = async (req, res, next) => {
    try {
        const postId = Number(req.params.postId);
        const result = await (0, like_services_1.toggleLike)(req.petId, postId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.toggle = toggle;
const byPost = async (req, res, next) => {
    try {
        const postId = Number(req.params.postId);
        const likes = await (0, like_services_1.getLikesByPost)(postId);
        res.json(likes);
    }
    catch (error) {
        next(error);
    }
};
exports.byPost = byPost;
