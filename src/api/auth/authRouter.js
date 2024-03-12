const express = require('express');
const passport = require('passport');
const User = require('../../dao/models/UserSchema');
const Cart = require('../../dao/models/CartSchema');
const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        // Primero, verifica si el usuario es el administrador.
        if (req.body.email === process.env.ADMIN_EMAIL && req.body.password === process.env.ADMIN_PASSWORD) {
            req.session.role = 'admin';
            return res.redirect('/products');
        }

        // Si no es el administrador, continúa con la verificación normal del usuario.
        const user = await User.findOne({ email: req.body.email });
        if (!user || !user.comparePassword(req.body.password)) {
            // Si las credenciales son incorrectas, redirige al login con un mensaje de error.
            return res.redirect('/login?error=El%20usuario%20o%20la%20contraseña%20son%20erróneos,%20por%20favor%20vuelva%20a%20verificar');
        }

         // Crea un nuevo carrito cada vez que el usuario inicia sesión.
            let cart = await Cart.create({ user: user._id, products: [] });
            user.cartId = cart._id;
            await user.save();
    
            // Configura la sesión del usuario.
            req.session.userId = user._id;
            req.session.role = user.role || 'usuario';
            req.session.cartId = cart._id;
    
            // Redirige al usuario a la página de productos.
            res.redirect('/products');
        } catch (error) {
            res.status(500).send(error.message);
        }
});

function haCaducado(cart) {
    // Implementa la lógica para determinar si el carrito ha caducado.
    const tiempoMaximo = 10 * 60 * 1000; //  10 min 
    const tiempoTranscurrido = new Date() - cart.updatedAt;
    return tiempoTranscurrido > tiempoMaximo;
}


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
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.redirect('/register?error=El correo ya existe');
        }

        // Crear un nuevo usuario (aún no lo guardamos en la base de datos)
        let newUser = new User({
            first_name,
            last_name,
            email,
            password,  // Aquí deberías hashear la contraseña antes de asignarla
            age,
            role: 'usuario'
        });

        // Crear un nuevo carrito para el usuario
        const newCart = await new Cart({ user: newUser._id, products: [] }).save();

        // Asignar el ID del carrito al usuario
        newUser.cart = newCart._id;

        // Guardar el usuario en la base de datos
        await newUser.save();

        // Configurar la sesión para el nuevo usuario
        req.session.userId = newUser._id;
        req.session.role = newUser.role;
        req.session.cartId = newCart._id;

        // Redirigir al usuario a la página de productos
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});





module.exports = router;

