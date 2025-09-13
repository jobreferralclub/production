import express from 'express';
import passport from 'passport';
import session from 'express-session';
import User from '../models/User.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import crypto from "crypto";

dotenv.config();

const router = express.Router();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    // Check if there's an existing user with the same email
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        // Link the existing account with Google
                        user.googleId = profile.id;
                        await user.save();
                    } else {
                        // Create new user
                        const randomPassword = crypto.randomBytes(12).toString("hex");

                        user = await User.create({
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            password: randomPassword,
                        });
                    }
                }
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

router.use(session({ secret: 'yourSecret', resave: false, saveUninitialized: false }));
router.use(passport.initialize());
router.use(passport.session());

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const user = req.user;
        const frontendUrl = `${process.env.FRONTEND_URL}/login?token=${user._id}`; // replace with JWT ideally
        res.redirect(frontendUrl);
    }
);

export default router;
