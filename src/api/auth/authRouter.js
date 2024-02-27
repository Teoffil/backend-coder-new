// src/api/auth/authRouter.js
const express = require('express');
const User = require('../../dao/models/UserSchema'); // Asegúrate de ajustar la ruta al archivo UserSchema.js
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        req.session.userId = user._id;
        res.redirect('/products');
    } catch (error) {
        res.status(500).send(error.message);
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
            return res.status(400).send('Correo o contraseña incorrectos');
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
