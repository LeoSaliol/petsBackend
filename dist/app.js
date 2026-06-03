"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
const pet_routes_1 = __importDefault(require("./routes/pet.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const like_routes_1 = __importDefault(require("./routes/like.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const follow_routes_1 = __importDefault(require("./routes/follow.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const conversation_routes_1 = __importDefault(require("./routes/conversation.routes"));
const favorite_routes_1 = __importDefault(require("./routes/favorite.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const attachPet_1 = require("./middlewares/attachPet");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const passport_1 = __importDefault(require("./config/passport"));
const app = (0, express_1.default)();
app.use(passport_1.default.initialize());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/auth', rateLimit_middleware_1.authLimiter, auth_routes_1.default);
app.use('/posts/all', (_req, _res, next) => next());
app.use(rateLimit_middleware_1.generalLimiter);
app.use('/auth', auth_routes_1.default);
app.use('/pets', pet_routes_1.default);
app.use('/posts', rateLimit_middleware_1.createPostLimiter, post_routes_1.default);
app.get('/me', auth_middleware_1.authMiddleware, attachPet_1.attachPet, (req, res) => {
    res.json({
        message: 'Access granted',
        petId: req.petId,
        user: {
            id: req.user.id,
        },
    });
});
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/likes', like_routes_1.default);
app.use('/comments', comment_routes_1.default);
app.use('/follow', follow_routes_1.default);
app.use('/users', user_routes_1.default);
app.use('/notifications', notifications_routes_1.default);
app.use('/conversations', conversation_routes_1.default);
app.use('/favorites', favorite_routes_1.default);
app.use(error_middleware_1.errorMidleware);
exports.default = app;
