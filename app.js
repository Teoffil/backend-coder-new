// Importación de módulos y librerías
const express = require('express');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// Importación de routers y modelos
const productsRouter = require('./src/api/products/productsRouter');
const cartsRouter = require('./src/api/carts/cartsRouter');
const authRouter = require('./src/api/auth/authRouter');
const productManager = require('./src/dao/mongo/productManager');
const User = require('./src/dao/models/UserSchema');
const { port } = require('./config');

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

// Configuración de la sesión
app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// Configuración de Passport
const passport = require('./src/config/passport');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())


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

Handlebars.registerHelper('multiply', function(a, b) { return a * b; });
Handlebars.registerHelper('totalPrice', function(products) {
    return products.reduce((total, product) => {
        return total + (product.quantity * product.productId.price);
    }, 0);
});


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
        
        let user = null;
        if (req.session.role === 'admin') {
            user = { role: 'admin' };
        } else if (req.session.userId) {
            user = await User.findById(req.session.userId);
            // Utiliza el cartId desde la sesión
            user.cartId = req.session.cartId;
        }

        res.render('products', {
            products: products.docs,
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

app.get('/current', async (req, res) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            res.json({ user: user });
        } catch (error) {
            res.status(500).send('Error fetching user');
        }
    } else {
        res.status(401).send('No user is currently logged in.');
    }
});

// Iniciar el servidor
server.listen(port, () => console.log(`Servidor corriendo en el puerto ${port}`));
