// Importación de módulos y librerías
const express = require('express');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const flash = require('connect-flash');

// Importación de routers y modelos
const productsRouter = require('./src/api/products/productsRouter');
const cartsRouter = require('./src/api/carts/cartsRouter');
const authRouter = require('./src/api/auth/authRouter');
const Message = require('./src/dao/models/MessageSchema');
const productManager = require('./src/dao/mongo/productManager');
const User = require('./src/dao/models/UserSchema');

// Creación de una nueva instancia de Handlebars
const Handlebars = allowInsecurePrototypeAccess(exphbs.create().handlebars);

// Registro del helper 'eq' con Handlebars
Handlebars.registerHelper('eq', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// Configuración de la base de datos
require('dotenv').config();
const connectDB = require('./database');
connectDB();

// Creación de la aplicación Express y el servidor HTTP
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuración de la sesión
app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// Configuración de Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

// Serialización y deserialización de usuarios
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Configuración de las estrategias Passport
passport.use('local-register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return done(null, false, { message: 'El correo ya existe' });
        }

        const user = new User({
            email: email,
            password: password
        });

        await user.save();

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Configura la estrategia local de login aquí, usando tu lógica existente de authRouter.js
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email });
        if (!user || !user.comparePassword(password)) {
            return done(null, false, { message: 'El usuario o la contraseña son erróneos' });
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
            const generatedEmail = `user-${profile.id}@githubuser.com`;
            user = await User.findOne({ email: generatedEmail });
            if (!user) {
                user = new User({
                    githubId: profile.id,
                    email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : generatedEmail,
                    password: 'dummy'
                });
                await user.save();
            }
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));






// Configuración de Handlebars
app.engine('handlebars', exphbs.engine({ handlebars: Handlebars }));
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Configuración del middleware para parsear JSON y cookies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Configuración de las rutas estáticas
app.use(express.static('public'));

// Configuración de las rutas de la API
app.use('/api/products', productsRouter);
app.use('/carts', cartsRouter);
app.use('/auth', authRouter);

// Configuración de las rutas de la aplicación
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/chat', (req, res) => {
    res.render('chat');
});

app.get('/register', (req, res) => {
    const errorMessage = req.query.error;
    res.render('register', { error: errorMessage });
});

app.get('/login', (req, res) => {
    const errorMessage = req.query.error;
    res.render('login', { error: errorMessage });
});

app.get('/products', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const products = await productManager.getProducts({ page: parseInt(page), limit: parseInt(limit) });
        const cartId = req.cookies.cartId;

        let user = null;
        if (req.session.role === 'admin') {
            user = { role: 'admin' };
        } else if (req.session.userId) {
            user = await User.findById(req.session.userId);
        }

        res.render('products', {
            products: products.docs,
            cartId: cartId,
            user: user,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page,
            hasNextPage: products.hasNextPage,
            hasPrevPage: products.hasPrevPage,
            prevLink: `/products?page=${products.prevPage}`,
            nextLink: `/products?page=${products.nextPage}`
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/products/:productId', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.productId);
        res.render('productDetails', { product });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Configuración de Socket.io para el chat
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado al chat.');

    Message.find().then(messages => {
        socket.emit('updateMessages', messages);
    });

    socket.on('newMessage', (msg) => {
        const message = new Message(msg);
        message.save().then(() => {
            Message.find().then(messages => {
                io.emit('updateMessages', messages);
            });
        });
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
