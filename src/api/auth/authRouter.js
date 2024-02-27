const express = require('express');
const User = require('../../dao/models/UserSchema'); 
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            // Si el correo ya existe, redirige con un mensaje de error.
            return res.redirect('/register?error=El%20correo%20ya%20existe');
        }

        const user = new User(req.body);
        await user.save();
        req.session.userId = user._id;
        res.redirect('/products');
    } catch (error) {
        // Para cualquier otro error de validación, redirige con un mensaje genérico.
        res.redirect('/register?error=Uno%20de%20los%20campos%20ingresados%20no%20cumple%20con%20lo%20requerido');
    }
});

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

module.exports = router;
