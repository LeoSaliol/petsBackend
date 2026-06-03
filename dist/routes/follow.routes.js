"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const follow_controller_1 = require("../controllers/follow.controller");
const attachPet_1 = require("../middlewares/attachPet");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware, attachPet_1.attachPet);
//! seguir / dejar de seguir
router.post('/:petId', follow_controller_1.toggle);
//! ver seguidores
router.get('/:petId/followers', follow_controller_1.followers);
//! ver seguidos
router.get('/:petId/following', follow_controller_1.following);
exports.default = router;
