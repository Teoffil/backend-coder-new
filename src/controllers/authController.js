const UserDAO = require('../dao/mongo/UserDAO');
const CartDAO = require('../dao/mongo/CartDAO');
const UserDTO = require('../dto/UserDTO'); 
const passport = require('passport');
const { adminEmail, adminPassword } = require('../../config');

const userDAO = new UserDAO();
const cartDAO = new CartDAO();

const authController = {
    login: async (req, res) => {
        try {
            if (req.body.email === adminEmail && req.body.password === adminPassword) {
                req.session.role = 'admin';
                return res.redirect('/products');
            }

            const user = await userDAO.getUserByEmail(req.body.email);
            if (!user || !await user.comparePassword(req.body.password)) {
                return res.redirect('/login?error=El%20usuario%20o%20la%20contraseña%20son%20erróneos,%20por%20favor%20vuelva%20a%20verificar');
            }

            let cart = await cartDAO.createCart(user._id);
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
            
            const existingUser = await userDAO.getUserByEmail(email);
            if (existingUser) {
                return res.redirect('/register?error=El correo ya existe');
            }

            const newUser = await userDAO.createUser({
                first_name,
                last_name,
                email,
                password,
                age,
                role: 'usuario'
            });

            // Asegúrate de que el usuario se ha creado correctamente antes de intentar crear un carrito
            if (!newUser) {
                throw new Error('No se pudo crear el usuario.');
            }

            const newCart = await cartDAO.createCart(newUser._id);
            if (!newCart) {
                throw new Error('No se pudo crear el carrito.');
            }

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
