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
                
                req.session.userId = 'admin';
                req.session.role = 'admin';
                
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
    
            // Verificar si el usuario ya tiene un carrito asignado
            let cart = await cartDAO.getCartById(user.cart);
            if (!cart) {
                cart = await cartDAO.createCart(user._id);
                user.cart = cart._id;
                await user.save();
            }
    
            const token = generateJWT(user);
            user.last_connection = new Date();
            await user.save();
    
            req.session.userId = user._id;
            req.session.role = user.role;
            req.session.cartId = user.cart;
    
            logger.info('User logged in successfully', { userId: user._id });
            res.json({ token, userId: user._id, cartId: user.cart });
        } catch (error) {
            logger.error('Login error', { error: error.message });
            res.status(error.statusCode || 500).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    logout: async (req, res) => {
        if (!req.session.userId) {
            logger.warn('No user ID found in session');
            return res.status(401).json({ message: 'User not authenticated' });
        }
    
        const userId = req.session.userId;
        logger.info(`Attempting to log out user with ID: ${userId}`);
    
        try {
            if (userId === 'admin') {
                // Manejo especial para el usuario administrador
                req.session.destroy(err => {
                    if (err) {
                        logger.error('Failed to destroy session for admin', { error: err.message });
                        return res.status(500).json({ message: 'Failed to logout' });
                    }
                    logger.info('Admin session destroyed successfully');
                    res.clearCookie('connect.sid');
                    res.json({ message: 'Logged out' });
                });
            } else {
                const user = await userDAO.getUserById(userId);
                if (!user) {
                    logger.warn('User not found');
                    return res.status(404).json({ message: 'User not found.' });
                }
    
                logger.info(`User found: ${JSON.stringify(user)}`);
    
                // Actualizar last_connection
                try {
                    user.last_connection = new Date();
                    await user.save();
                    logger.info('User last_connection updated');
                } catch (updateError) {
                    logger.error('Failed to update last_connection', { error: updateError.message });
                    return res.status(500).json({ message: 'Failed to update last_connection' });
                }
    
                req.session.destroy(err => {
                    if (err) {
                        logger.error('Failed to destroy session', { error: err.message });
                        return res.status(500).json({ message: 'Failed to logout' });
                    }
                    logger.info('Session destroyed successfully');
                    res.clearCookie('connect.sid');
                    res.json({ message: 'Logged out' });
                });
            }
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
                req.flash('error', 'Email already registered.');
                return res.redirect('/register');
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
                req.flash('error', 'Failed to create a new user.');
                return res.redirect('/register');
            }
    
            const newCart = await cartDAO.createCart(newUser._id);
            if (!newCart) {
                logger.error('Failed to create a cart for new user');
                req.flash('error', 'Failed to create a cart for new user.');
                return res.redirect('/register');
            }
    
            newUser.cart = newCart._id;
            await newUser.save();
    
            logger.info('User registered successfully', { userId: newUser._id });
            res.redirect('/register?success=true');
        } catch (error) {
            logger.error('Registration error', { error: error.message });
            req.flash('error', error.message || INTERNAL_SERVER_ERROR.message);
            res.redirect('/register');
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
