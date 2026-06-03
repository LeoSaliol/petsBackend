import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: googleCallbackURL,
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    const name = profile.displayName || profile.name?.givenName || 'User';

                    if (!email) {
                        return done(new Error('No email provided by Google'));
                    }

                    let user = await prisma.user.findUnique({ where: { email } });

                    if (!user) {
                        user = await prisma.user.create({
                            data: {
                                name,
                                email,
                                password: 'oauth-google',
                                provider: 'google',
                                providerId: profile.id,
                            },
                        });
                    }

                    const accessToken = generateAccessToken(user.id);
                    const refreshToken = generateRefreshToken(user.id);

                    await prisma.user.update({
                        where: { id: user.id },
                        data: { refreshToken },
                    });

                    const pets = await prisma.pet.findMany({
                        where: { ownerId: user.id },
                    });

                    done(null, {
                        user,
                        accessToken,
                        refreshToken,
                        petId: pets[0]?.id,
                    });
                } catch (error) {
                    done(error);
                }
            }
        )
    );
}

export default passport;