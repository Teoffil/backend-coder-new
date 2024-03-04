const express = require('express');
const passport = require('passport');
const User = require('../../dao/models/UserSchema');
const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        // Comprueba si las credenciales ingresadas son las del administrador
        if (req.body.email === process.env.ADMIN_EMAIL && req.body.password === process.env.ADMIN_PASSWORD) {
            req.session.role = 'admin';
            return res.redirect('/products');
        }

        // Si no, procede con el inicio de sesión normal
        const user = await User.findOne({ email: req.body.email });
        if (!user || !user.comparePassword(req.body.password)) {
            // Cambio aquí para redirigir con un mensaje de error
            return res.redirect('/login?error=El%20usuario%20o%20la%20contraseña%20son%20erróneos,%20por%20favor%20vuelva%20a%20verificar');
        }
        req.session.userId = user._id;
        req.session.role = 'usuario';
        res.redirect('/products');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/products');
        }
        res.clearCookie('connect.sid');
        res.redirect('/products');
    });
});
// Ruta para iniciar la autenticación con GitHub
router.get('/github', passport.authenticate('github'))

// Ruta para manejar el callback después de la autenticación con GitHub
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    // Autenticación exitosa, establecer la información del usuario en la sesión.
    req.session.userId = req.user._id;
    req.session.role = req.user.role || 'usuario'; // Ajusta según cómo estés manejando los roles
    res.redirect('/products');
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/products');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;

