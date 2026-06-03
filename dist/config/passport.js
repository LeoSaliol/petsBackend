"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = require("./prisma");
const jwt_1 = require("../utils/jwt");
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback';
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: googleCallbackURL,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName || profile.name?.givenName || 'User';
            if (!email) {
                return done(new Error('No email provided by Google'), null);
            }
            let user = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (!user) {
                user = await prisma_1.prisma.user.create({
                    data: {
                        name,
                        email,
                        password: 'oauth-google',
                        provider: 'google',
                        providerId: profile.id,
                    },
                });
            }
            const accessToken = (0, jwt_1.generateAccessToken)(user.id);
            const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { refreshToken },
            });
            const pets = await prisma_1.prisma.pet.findMany({
                where: { ownerId: user.id },
            });
            done(null, {
                user,
                accessToken,
                refreshToken,
                petId: pets[0]?.id,
            });
        }
        catch (error) {
            done(error, null);
        }
    }));
}
exports.default = passport_1.default;
