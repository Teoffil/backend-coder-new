const UserDAO = require('../dao/mongo/UserDAO');
const CartDAO = require('../dao/mongo/CartDAO');
const UserDTO = require('../dto/UserDTO');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { adminEmail, adminPassword, JWT_SECRET } = require('../../config');
const { DUPLICATE_USER, INVALID_LOGIN, UNAUTHORIZED, USER_NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../utils/errorMessages');

const userDAO = new UserDAO();
const cartDAO = new CartDAO();

const authController = {
    login: async (req, res) => {
        try {
            if (req.body.email === adminEmail && req.body.password === adminPassword) {
                const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
                return res.json({ token });
            }

            const user = await userDAO.getUserByEmail(req.body.email);
            if (!user || !await user.comparePassword(req.body.password)) {
                const error = new Error(INVALID_LOGIN.message);
                error.statusCode = INVALID_LOGIN.statusCode;
                throw error;
            }

            let cart = await cartDAO.createCart(user._id);
            const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

            res.json({ token, userId: user._id, cartId: cart._id });
        } catch (error) {
            res.status(error.statusCode || 500).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    logout: (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Failed to logout');
            }
            res.clearCookie('connect.sid');
            res.send('Logged out');
        });
    },

    register: async (req, res) => {
        try {
            const { first_name, last_name, email, password, age } = req.body;
            
            const existingUser = await userDAO.getUserByEmail(email);
            if (existingUser) {
                const error = new Error(DUPLICATE_USER.message);
                error.statusCode = DUPLICATE_USER.statusCode;
                throw error;
            }

            const newUser = await userDAO.createUser({
                first_name,
                last_name,
                email,
                password,
                age,
                role: 'usuario'
            });

            if (!newUser) {
                const error = new Error(INTERNAL_SERVER_ERROR.message);
                error.statusCode = INTERNAL_SERVER_ERROR.statusCode;
                throw error;
            }

            const newCart = await cartDAO.createCart(newUser._id);
            if (!newCart) {
                const error = new Error(INTERNAL_SERVER_ERROR.message);
                error.statusCode = INTERNAL_SERVER_ERROR.statusCode;
                throw error;
            }

            res.status(201).json({ message: 'User registered', userId: newUser._id });
        } catch (error) {
            res.status(error.statusCode || 500).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    githubAuth: passport.authenticate('github'),

    githubCallback: passport.authenticate('github', { failureRedirect: '/login' }, (req, res) => {
        const token = jwt.sign({ id: req.user._id, role: req.user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }),

    currentUser: async (req, res) => {
        if (req.isAuthenticated()) {
            const user = await userDAO.getUserById(req.session.userId);
            const userDto = new UserDTO(user);
            res.json({ user: userDto });
        } else {
            const error = new Error(UNAUTHORIZED.message);
            error.statusCode = UNAUTHORIZED.statusCode;
            res.status(error.statusCode).json({ message: error.message });
        }
    },
};

module.exports = authController;
