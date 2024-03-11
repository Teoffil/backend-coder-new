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
        req.session.role = user.role || 'usuario';
        console.log('Sesión establecida:', req.session);
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

// Ruta para obtener el usuario actual basado en la sesión
router.get('/current', (req, res) => {
    console.log('Usuario actual:', req.user);
    console.log('Sesión actual:', req.session);
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ message: 'No user logged in' });
    }
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

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, age } = req.body;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.redirect('/register?error=El correo ya existe');
        }
        const newUser = new User({
            first_name,
            last_name,
            email,
            password, // Recuerda hashearla
            age,
            role: 'usuario' // o cualquier lógica para establecer roles
        });
        await newUser.save();
        // Iniciar sesión automáticamente después del registro o redirigir al login
        req.session.userId = newUser._id;
        req.session.role = newUser.role;
        res.redirect('/products');
    } catch (error) {
        res.status(500).send(error.message);
    }
});


module.exports = router;

