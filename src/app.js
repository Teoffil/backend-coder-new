const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const productsRouter = require('./api/products/productsRouter');
const cartsRouter = require('./api/carts/cartsRouter');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware para parsear JSON
app.use(express.json());

// Rutas para productos y carritos
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Directorio público para servir archivos estáticos
app.use(express.static('public'));

// Ruta principal que carga los productos y los pasa a la vista
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'products.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error leyendo el archivo products.json:', err);
            res.status(500).send('Error al leer los datos de los productos');
            return;
        }
        const products = JSON.parse(data);
        console.log('Productos leídos correctamente:', products);
        res.render('home', { products }); // Pasa los productos a la vista
    });
});

// Ruta para productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
});

// Función auxiliar para leer productos
function readProductsFromFile() {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, 'data', 'products.json');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(JSON.parse(data));
        });
    });
}

// Función auxiliar para escribir productos en el archivo
function writeProductsToFile(products) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, 'data', 'products.json');
        fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf8', (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

// Configuración de Socket.io para manejar la conexión y los eventos
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');
    
    // Emitir la lista actual de productos cuando un usuario se conecta
    readProductsFromFile().then(products => {
        socket.emit('updateProducts', products);
    });

    // Manejar el evento 'addProduct'
    socket.on('addProduct', async (newProduct) => {
        try {
            const products = await readProductsFromFile();
            newProduct.id = products.length + 1; // Asignar un nuevo ID basado en la longitud
            products.push(newProduct);
            await writeProductsToFile(products);
            io.emit('updateProducts', products); // Emitir a todos los clientes
        } catch (error) {
            console.error('Error al agregar producto:', error);
        }
    });
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
