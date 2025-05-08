const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ socialId: profile.id });
    if (!user) {
        user = await User.create({ name: profile.displayName, socialId: profile.id, provider: 'google' });
    }
    return done(null, user);
}));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback"
},
async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ socialId: profile.id });
    if (!user) {
        user = await User.create({ name: profile.displayName, socialId: profile.id, provider: 'facebook' });
    }
    return done(null, user);
}));
