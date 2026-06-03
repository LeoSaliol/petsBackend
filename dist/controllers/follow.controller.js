"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.following = exports.followers = exports.toggle = void 0;
const follow_service_1 = require("../services/follow.service");
const toggle = async (req, res, next) => {
    try {
        const followingId = Number(req.params.petId);
        const result = await (0, follow_service_1.toggleFollow)(req.petId, //* usuario logueado
        followingId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.toggle = toggle;
const followers = async (req, res, next) => {
    try {
        const petId = Number(req.params.id);
        const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
        const followers = await (0, follow_service_1.getFollowers)(petId, cursor);
        res.json({
            success: true,
            data: followers,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.followers = followers;
const following = async (req, res, next) => {
    try {
        const petId = Number(req.params.petId);
        const result = await (0, follow_service_1.getFollowing)(petId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.following = following;
