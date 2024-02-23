const express = require('express');
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');

const productsRouter = require('./src/api/products/productsRouter');
const cartsRouter = require('./src/api/carts/cartsRouter');
const Message = require('./src/dao/models/MessageSchema');
const productManager = require('./src/dao/mongo/productManager');

require('dotenv').config();
const connectDB = require('./database');
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuración de Handlebars
app.engine('handlebars', engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Middleware para parsear JSON y cookies
app.use(express.json());
app.use(cookieParser());

// Rutas estáticas
app.use(express.static('public'));

// Rutas de la API
app.use('/api/products', productsRouter);
app.use('/carts', cartsRouter);

// Rutas de la aplicación
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/chat', (req, res) => {
    res.render('chat');
});

app.get('/products', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const products = await productManager.getProducts({ page: parseInt(page), limit: parseInt(limit) });
        // Obtén el ID del carrito de la cookie
        const cartId = req.cookies.cartId;
        res.render('products', { 
            products: products.docs, 
            cartId: cartId, // Asegúrate de pasar el cartId a la plantilla
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
