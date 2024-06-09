// Importación de módulos y librerías
const express = require('express');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const http = require('http');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const UserDTO = require('./src/dto/UserDTO');
const logger = require('./src/config/logger'); // Importar el logger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swaggerConfig');
const path = require('path'); // Importar path

// Importación de routers y modelos
const productsRouter = require('./src/api/products/productsRouter');
const cartsRouter = require('./src/api/carts/cartsRouter');
const authRouter = require('./src/api/auth/authRouter');
const messageRoutes = require('./src/api/messages/messageRoutes');
const generalRouter = require('./src/api/generalRouter');
const usersRouter = require('./src/api/users/usersRouter');
const ProductDAO = require('./src/dao/mongo/ProductDAO');
const productManager = new ProductDAO(); // Creando una instancia de ProductDAO
const User = require('./src/dao/models/UserSchema');
const Cart = require('./src/dao/models/CartSchema');
const { port } = require('./config');
const errorHandler = require('./src/middleware/errorHandler');

// Creación de una nueva instancia de Handlebars y configuración de helpers
const Handlebars = exphbs.create({
    handlebars: allowInsecurePrototypeAccess(require('handlebars'))
});

// Registro de helpers 'eq', 'multiply' y 'totalPrice'
Handlebars.handlebars.registerHelper('eq', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
Handlebars.handlebars.registerHelper('multiply', function(value1, value2) {
    return value1 * value2;
});
Handlebars.handlebars.registerHelper('totalPrice', function(products) {
    return products.reduce((total, product) => {
        return total + (product.productId.price * product.quantity);
    }, 0);
});
Handlebars.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// Configuración de la base de datos
require('dotenv').config();
const connectDB = require('./database');

// Intenta conectar a la base de datos y maneja cualquier error fatal
connectDB().catch(err => {
    logger.fatal('Failed to connect to MongoDB', err);
    process.exit(1);
});

// Creación de la aplicación Express y el servidor HTTP
const app = express();

// Configuración de la sesión
app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { secure: false, maxAge: 3600000 } 
}));

// Configuración de Passport
const passport = require('./src/config/passport');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Configuración de Handlebars como motor de plantillas
app.engine('handlebars', exphbs.engine({ handlebars: Handlebars.handlebars }));
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Configuración del middleware para parsear JSON y cookies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Middleware para registrar cada solicitud HTTP
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
});

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware para cargar el usuario y el carrito
app.use(async (req, res, next) => {
    if (req.session.userId) {
        const user = await User.findById(req.session.userId).populate('cart');
        req.user = user;
        req.cartId = user.cart ? user.cart._id : null;
    }
    next();
});

// Configuración de las rutas de la API usando un router común
const apiRouter = express.Router();
apiRouter.use('/products', productsRouter);
apiRouter.use('/carts', cartsRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/test', generalRouter);
apiRouter.use('/users', usersRouter);
app.use('/api', apiRouter);

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
            user = await User.findById(req.session.userId).populate('cart');
            user.cartId = user.cart ? user.cart._id : null;
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
        logger.error("Error fetching products: ", error);
        res.status(500).send(error.message);
    }
});
app.get('/products/:productId', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.productId);
        res.render('productDetails', { product });
    } catch (error) {
        logger.error("Error fetching product details: ", error);
        res.status(500).send(error.message);
    }
});
app.get('/current', async (req, res) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            const userDto = new UserDTO(user); // Usando UserDTO para filtrar los datos
            res.json(userDto);
        } catch (error) {
            logger.error("Error fetching user: ", error);
            res.status(500).send('Error fetching user');
        }
    } else {
        res.status(401).send('No user is currently logged in.');
    }
});

// Ruta para el formulario de restablecimiento de contraseña
app.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    res.render('resetPassword', { token });
});

// Ruta para indicar que el enlace ha expirado
app.get('/link-expired', (req, res) => {
    res.render('linkExpired');
});

// Ruta para gestionar usuarios (solo accesible para administradores)
app.get('/admin/users', async (req, res) => {
    logger.debug('Ruta /admin/users accedida');
    if (req.session.role === 'admin') {
        logger.debug('Rol de usuario: admin');
        try {
            const users = await User.find({});
            res.render('adminUsers', { users });
        } catch (error) {
            logger.error('Error fetching users:', error);
            res.status(500).send('Error fetching users');
        }
    } else {
        logger.warn('Acceso denegado: El usuario no es administrador');
        res.status(403).send('Access denied');
    }
});

//final de todas las rutas
app.use(errorHandler);

// Exportar la app para pruebas y no iniciar el servidor aquí si está siendo requerido como un módulo
if (require.main === module) {
    // Creación y ejecución del servidor HTTP solo si el archivo se ejecuta directamente
    const server = http.createServer(app);
    server.listen(port, () => console.log(`Servidor corriendo en el puerto ${port}`));
} else {
    // Exportar la aplicación para ser usada en tests u otros módulos
    module.exports = app;
}
