const express = require('express');
const passport = require('passport');
const authController = require('../../controllers/authController');
const UserDTO = require('../../dto/UserDTO');
const User = require('../../dao/models/UserSchema');
const { authorize } = require('../../middleware/authorization');
const router = express.Router();

// Login
router.post('/login', authController.login);

// Logout
router.get('/logout', authController.logout);

// Mostrar formulario de registro
router.get('/register', (req, res) => {
    res.render('register', {
        error: req.flash('error')
    });
});

// Procesar el formulario de registro
router.post('/register', authController.register);

// Iniciar la autenticación con GitHub
router.get('/github', passport.authenticate('github'));

// Callback de la autenticación de GitHub
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    req.session.userId = req.user._id;
    req.session.role = req.user.role || 'user';
    res.redirect('/products');
});

// Obtener el usuario actual de manera segura utilizando un DTO
router.get('/current', async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const user = await User.findById(req.user._id).select('first_name last_name email');
            const userDto = new UserDTO(user);
            res.json(userDto);
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).send('Error fetching user');
        }
    } else {
        res.status(401).json({ message: 'No user logged in' });
    }
});

// Rutas para recuperación de contraseña
router.post('/request-reset', authController.requestPasswordReset);
router.get('/reset-password/:token', authController.showResetForm);
router.post('/reset-password/:token', authController.resetPassword);

// Ruta para enviar un correo de prueba
router.get('/mail', authController.sendTestMail);

// Ruta cambio de rol
router.put('/role/:id', authorize(['admin']), authController.changeUserRole);

module.exports = router;
