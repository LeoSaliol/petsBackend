"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.remove = exports.postsByPet = exports.feed = exports.create = exports.getPost = void 0;
const post_services_1 = require("../services/post.services");
const getPost = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const post = await (0, post_services_1.getPostById)(id);
        res.json(post);
    }
    catch (error) {
        next(error);
    }
};
exports.getPost = getPost;
const create = async (req, res, next) => {
    try {
        const { petId, content, location } = req.body;
        const image = req.file?.path;
        if (!petId || !image) {
            return res
                .status(400)
                .json({ message: 'petId and image are required' });
        }
        const post = await (0, post_services_1.createPost)(Number(petId), req.user.id, content, image, location);
        res.status(201).json(post);
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const feed = async (req, res, next) => {
    try {
        const { cursor, petId } = req.query;
        const posts = await (0, post_services_1.getFeed)(cursor ? String(cursor) : undefined, petId ? Number(petId) : undefined);
        res.json({ success: true, data: posts });
    }
    catch (error) {
        next(error);
    }
};
exports.feed = feed;
const postsByPet = async (req, res, next) => {
    try {
        const petId = Number(req.params.petId);
        const requestingPetId = req.petId || (req.query.petId ? Number(req.query.petId) : undefined);
        const posts = await (0, post_services_1.getPostsByPet)(petId, requestingPetId);
        res.json(posts);
    }
    catch (error) {
        next(error);
    }
};
exports.postsByPet = postsByPet;
const remove = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const result = await (0, post_services_1.deletePost)(id);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.remove = remove;
const update = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { content, location } = req.body;
        const image = req.file?.path;
        const post = await (0, post_services_1.updatePost)(id, content, image, location);
        res.json(post);
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
