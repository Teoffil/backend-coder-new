const UserDAO = require('../dao/mongo/UserDAO');
const CartDAO = require('../dao/mongo/CartDAO');
const UserDTO = require('../dto/UserDTO');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { adminEmail, adminPassword, JWT_SECRET } = require('../../config');

const userDAO = new UserDAO();
const cartDAO = new CartDAO();

const authController = {
    login: async (req, res) => {
        try {
            if (req.body.email === adminEmail && req.body.password === adminPassword) {
                // Generar token para admin
                const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
                return res.json({ token });
            }

            const user = await userDAO.getUserByEmail(req.body.email);
            if (!user || !await user.comparePassword(req.body.password)) {
                return res.status(401).json({ error: 'El usuario o la contraseña son erróneos' });
            }

            let cart = await cartDAO.createCart(user._id);
            const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

            res.json({ token, userId: user._id, cartId: cart._id });
        } catch (error) {
            res.status(500).send(error.message);
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
                return res.status(409).json({ error: 'El correo ya existe' });
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
                throw new Error('No se pudo crear el usuario.');
            }

            const newCart = await cartDAO.createCart(newUser._id);
            if (!newCart) {
                throw new Error('No se pudo crear el carrito.');
            }

            res.status(201).json({ message: 'User registered', userId: newUser._id });
        } catch (error) {
            res.status(500).send(error.message);
        }
    },

    githubAuth: passport.authenticate('github'),

    githubCallback: passport.authenticate('github', { failureRedirect: '/login' }, (req, res) => {
        // Suponiendo que la autenticación de GitHub también debería devolver un token.
        const token = jwt.sign({ id: req.user._id, role: req.user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }),

    currentUser: async (req, res) => {
        if (req.isAuthenticated()) {
            const user = await userDAO.getUserById(req.session.userId);
            const userDto = new UserDTO(user);
            res.json({ user: userDto });
        } else {
            res.status(401).json({ message: 'No user logged in' });
        }
    },
};

module.exports = authController;
