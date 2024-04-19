const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../dao/models/UserSchema');
const { githubClientId, githubClientSecret } = require('../../config');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Estrategia de registro local
passport.use('local-register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return done(null, false, { message: 'El correo ya existe' });
        }
        const user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email,
            age: req.body.age,
            password,
            cart: req.body.cart,
            role: 'user'
        });

        await user.save();
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Estrategia de login local
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user || !user.comparePassword(password)) {
            return done(null, false, { message: 'El usuario o la contraseña son erróneos' });
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Estrategia de GitHub
passport.use(new GitHubStrategy({
    clientID: githubClientId,
    clientSecret: githubClientSecret,
    callbackURL: "http://localhost:8080/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
            const generatedEmail = `user-${profile.id}@githubuser.com`;
            user = await User.findOne({ email: generatedEmail });
            if (!user) {
                user = new User({
                    githubId: profile.id,
                    email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : generatedEmail,
                    password: 'dummy'
                });
                await user.save();
            }
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

module.exports = passport;
