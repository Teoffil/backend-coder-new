const express = require('express');
const ProductManager = require('./productManager');

const app = express();
const productManager = new ProductManager('../products.json');

// Endpoint para obtener productos
app.get('/products', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        const limit = req.query.limit;
        res.json(limit ? products.slice(0, Number(limit)) : products);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpoint para obtener un producto específico
app.get('/products/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid, 10);
        const product = await productManager.getProductById(productId);
        if (product) {
            res.json(product);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

const PORT = 8080; // Puedes elegir otro puerto
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
