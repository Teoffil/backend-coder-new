const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const productsRouter = require('./src/api/products/productsRouter');
const cartsRouter = require('./src/api/carts/cartsRouter');
const Message = require('./src/dao/models/MessageSchema'); // Asegúrate de tener este modelo

require('dotenv').config();
const connectDB = require('./database');
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Middleware para parsear JSON
app.use(express.json());

// Rutas para productos y carritos
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Directorio público para servir archivos estáticos
app.use(express.static('public'));

// Ruta principal que carga la vista del chat
app.get('/chat', (req, res) => {
    res.render('chat');
});

// Ruta para la página de inicio
app.get('/', (req, res) => {
    res.render('home'); // Renderiza 'home.handlebars' en la ruta raíz.
});

// Configuración de Socket.io para manejar la conexión y los eventos de chat
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado al chat.');

    // Emitir todos los mensajes previos al usuario que se conecta
    Message.find().then(messages => {
        socket.emit('updateMessages', messages);
    });

    // Escuchar por nuevos mensajes
    socket.on('newMessage', (msg) => {
        // Guardar el mensaje en la base de datos
        const message = new Message(msg);
        message.save().then(() => {
            // Emitir el mensaje a todos los usuarios conectados
            Message.find().then(messages => {
                io.emit('updateMessages', messages);
            });
        });
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
