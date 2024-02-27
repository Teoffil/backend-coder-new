// Importación de módulos y librerías
const express = require('express');
const exphbs  = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

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
    secret: 'mySecret', // Cambia esto por tu propia cadena secreta
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }) // Asegúrate de tener una variable de entorno MONGO_URI
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
    const errorMessage = req.query.error; // Captura el mensaje de error de los parámetros de consulta.
    res.render('register', { error: errorMessage }); // Pasa el mensaje de error a la vista.
});


app.get('/login', (req, res) => {
    const errorMessage = req.query.error; // Captura el mensaje de error de los parámetros de consulta
    res.render('login', { error: errorMessage }); // Pasa el mensaje de error a la vista
});


app.get('/products', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const products = await productManager.getProducts({ page: parseInt(page), limit: parseInt(limit) });
        const cartId = req.cookies.cartId; // Obtén el ID del carrito de la cookie

        // Modificación aquí: Crea un objeto de usuario basado en la sesión
        let user = null;
        if (req.session.role === 'admin') {
            user = { role: 'admin' }; // Define un usuario administrador
        } else if (req.session.userId) {
            user = await User.findById(req.session.userId); // Busca el usuario en la base de datos
        }

        res.render('products', { 
            products: products.docs, 
            cartId: cartId,
            user: user, // Pasa el objeto de usuario a la vista
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
