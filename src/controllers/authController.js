const UserDAO = require('../dao/mongo/UserDAO');
const CartDAO = require('../dao/mongo/CartDAO');
const UserDTO = require('../dto/UserDTO');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { adminEmail, adminPassword, JWT_SECRET } = require('../../config');
const logger = require('../config/logger');
const { DUPLICATE_USER, INVALID_LOGIN, UNAUTHORIZED, USER_NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../utils/errorMessages');
const { sendResetEmail, sendTestEmail } = require('../utils/emailService');

const userDAO = new UserDAO();
const cartDAO = new CartDAO();

const generateJWT = (user) => {
    return jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role
    }, JWT_SECRET, { expiresIn: '1h' });
};

const authController = {
    login: async (req, res) => {
        try {
            if (req.body.email === adminEmail && req.body.password === adminPassword) {
                const token = generateJWT({ _id: 'admin', email: adminEmail, role: 'admin' });
                logger.info('Admin logged in successfully');
                return res.json({ token });
            }

            const user = await userDAO.getUserByEmail(req.body.email);
            if (!user || !await user.comparePassword(req.body.password)) {
                logger.warn('Login attempt failed', { email: req.body.email });
                const error = new Error(INVALID_LOGIN.message);
                error.statusCode = INVALID_LOGIN.statusCode;
                throw error;
            }

            const cart = await cartDAO.createCart(user._id);
            const token = generateJWT(user);

            // Actualizar last_connection
            user.last_connection = new Date();
            await user.save();

            logger.info('User logged in successfully', { userId: user._id });
            res.json({ token, userId: user._id, cartId: cart._id });
        } catch (error) {
            logger.error('Login error', { error: error.message });
            res.status(error.statusCode || 500).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    logout: async (req, res) => {
        const { id } = req.user;
        try {
            const user = await userDAO.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Actualizar last_connection
            user.last_connection = new Date();
            await user.save();

            req.session.destroy(err => {
                if (err) {
                    logger.error('Logout failed', { error: err.message });
                    return res.status(500).send('Failed to logout');
                }
                logger.info('User logged out successfully');
                res.clearCookie('connect.sid');
                res.send('Logged out');
            });
        } catch (error) {
            logger.error('Failed to logout', { error: error.message });
            res.status(500).json({ message: 'Failed to logout' });
        }
    },

    register: async (req, res) => {
        try {
            const { first_name, last_name, email, password, age } = req.body;
            const existingUser = await userDAO.getUserByEmail(email);
            if (existingUser) {
                logger.warn('Registration attempt failed - duplicate email', { email });
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
                role: 'user'
            });
            if (!newUser) {
                logger.error('Failed to create a new user');
                throw new Error(INTERNAL_SERVER_ERROR.message);
            }

            const newCart = await cartDAO.createCart(newUser._id);
            if (!newCart) {
                logger.error('Failed to create a cart for new user');
                throw new Error(INTERNAL_SERVER_ERROR.message);
            }

            logger.info('User registered successfully', { userId: newUser._id });
            res.status(201).json({ message: 'User registered', userId: newUser._id });
        } catch (error) {
            logger.error('Registration error', { error: error.message });
            res.status(error.statusCode || 500).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    githubAuth: passport.authenticate('github'),

    githubCallback: passport.authenticate('github', { failureRedirect: '/login' }, (req, res) => {
        const token = generateJWT(req.user);
        logger.info('GitHub login successful', { userId: req.user._id });
        res.json({ token });
    }),

    currentUser: async (req, res) => {
        if (req.isAuthenticated()) {
            const user = await userDAO.getUserById(req.session.userId);
            const userDto = new UserDTO(user);
            logger.info('Current user data fetched', { userId: user._id });
            res.json({ user: userDto });
        } else {
            logger.warn('Unauthorized attempt to fetch current user data');
            const error = new Error(UNAUTHORIZED.message);
            error.statusCode = UNAUTHORIZED.statusCode;
            res.status(error.statusCode).json({ message: error.message });
        }
    },

    requestPasswordReset: async (req, res) => {
        try {
            const user = await userDAO.getUserByEmail(req.body.email);
            if (!user) {
                return res.status(404).send('No user found with that email address.');
            }
            const token = generateJWT(user);
            await sendResetEmail(user.email, token);
            logger.info('Password reset email sent successfully', { email: user.email });
            res.send('Password reset email sent.');
        } catch (error) {
            logger.error('Failed to send password reset email', { error: error.message });
            res.status(500).send('Failed to send password reset email.');
        }
    },

    showResetForm: async (req, res) => {
        const { token } = req.params;
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            res.render('resetPassword', { token });
        } catch (error) {
            res.render('linkExpired');
        }
    },

    resetPassword: async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await userDAO.getUserById(decoded.id);
            if (await user.comparePassword(password)) {
                return res.status(400).send('New password cannot be the same as the old password.');
            }
            user.password = password;
            await user.save();
            res.send('Password has been reset successfully.');
        } catch (error) {
            logger.error('Failed to reset password', { error: error.message });
            res.render('linkExpired');
        }
    },

    sendTestMail: async (req, res) => {
        try {
            await sendTestEmail('correo_destino@example.com');
            res.send('Correo de prueba enviado con éxito!');
        } catch (error) {
            logger.error('Error al enviar el correo de prueba:', error);
            res.status(500).send('Error al enviar el correo de prueba');
        }
    },
    
    changeUserRole: async (req, res) => {
        const { id } = req.params;
        const { role } = req.body;
        try {
            const validRoles = ['user', 'admin', 'premium'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: 'Invalid role specified.' });
            }

            const updatedUser = await userDAO.updateUserRole(id, role);

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.json({ message: 'User role updated successfully.', user: updatedUser });
        } catch (error) {
            logger.error('Failed to change user role', { error: error.message });
            res.status(500).json({ message: 'Failed to change user role.' });
        }
    }
};

module.exports = authController;
