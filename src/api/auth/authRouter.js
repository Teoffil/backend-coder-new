const express = require('express');
const passport = require('passport');
const authController = require('../../controllers/authController'); 

const router = express.Router();

// Login
router.post('/login', authController.login);

// Logout
router.get('/logout', authController.logout);

// Registro
router.post('/register', authController.register);

// Iniciar la autenticación con GitHub
router.get('/github', passport.authenticate('github'));

// Callback de la autenticación de GitHub
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    // Autenticación exitosa, establecer la información del usuario en la sesión.
    req.session.userId = req.user._id;
    req.session.role = req.user.role || 'usuario';
    res.redirect('/products');
});

// Obtener el usuario actual
router.get('/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ message: 'No user logged in' });
    }
});

module.exports = router;
