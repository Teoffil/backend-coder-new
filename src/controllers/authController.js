const User = require('../dao/models/UserSchema');
const Cart = require('../dao/models/CartSchema');
const passport = require('passport');
const { adminEmail, adminPassword } = require('../../config');

const authController = {
    login: async (req, res) => {
        try {
            if (req.body.email === adminEmail && req.body.password === adminPassword) {
                req.session.role = 'admin';
                return res.redirect('/products');
            }

            const user = await User.findOne({ email: req.body.email });
            if (!user || !user.comparePassword(req.body.password)) {
                return res.redirect('/login?error=El%20usuario%20o%20la%20contraseña%20son%20erróneos,%20por%20favor%20vuelva%20a%20verificar');
            }

            let cart = await Cart.create({ user: user._id, products: [] });
            user.cartId = cart._id;
            await user.save();

            req.session.userId = user._id;
            req.session.role = user.role || 'usuario';
            req.session.cartId = cart._id;

            res.redirect('/products');
        } catch (error) {
            res.status(500).send(error.message);
        }
    },

    logout: (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('/products');
            }
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    },

    register: async (req, res) => {
        try {
            const { first_name, last_name, email, password, age } = req.body;
            
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                return res.redirect('/register?error=El correo ya existe');
            }

            let newUser = new User({
                first_name,
                last_name,
                email,
                password,
                age,
                role: 'usuario'
            });

            const newCart = await new Cart({ user: newUser._id, products: [] }).save();
            newUser.cart = newCart._id;

            await newUser.save();

            req.session.userId = newUser._id;
            req.session.role = newUser.role;
            req.session.cartId = newCart._id;

            res.redirect('/products');
        } catch (error) {
            res.status(500).send(error.message);
        }
    },

    githubAuth: passport.authenticate('github'),

    githubCallback: passport.authenticate('github', { failureRedirect: '/login' }, (req, res) => {
        req.session.userId = req.user._id;
        req.session.role = req.user.role || 'usuario';
        res.redirect('/products');
    }),

    currentUser: (req, res) => {
        if (req.isAuthenticated()) {
            res.json({ user: req.user });
        } else {
            res.status(401).json({ message: 'No user logged in' });
        }
    },
};

module.exports = authController;
