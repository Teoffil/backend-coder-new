const express = require('express');
const productsRouter = require('./api/products/productsRouter'); // Asegúrate de que la ruta sea correcta
const cartsRouter = require('./api/carts/cartsRouter'); // Asegúrate de que la ruta sea correcta

const app = express();

app.use(express.json()); // Middleware para parsear JSON

app.use('/api/products', productsRouter); // Ruta para productos
app.use('/api/carts', cartsRouter); // Ruta para carritos

const PORT = 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

