"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.profile = void 0;
const user_services_1 = require("../services/user.services");
const profile = async (req, res, next) => {
    try {
        const profileUserId = Number(req.params.userId);
        const { userId } = req.query;
        const result = await (0, user_services_1.getProfile)(profileUserId, Number(userId));
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.profile = profile;
const updateProfile = async (req, res, next) => {
    try {
        const profileUserId = Number(req.params.userId);
        const { name, bio } = req.body;
        const image = req.file?.path;
        const updateData = { name, bio, image };
        const result = await (0, user_services_1.updateProfileService)(profileUserId, updateData);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
