const express = require('express');
const ProductManager = require('../../managers/productManager'); // Asegúrate de que la ruta sea correcta
const router = express.Router();
const path = require('path');
const filePath = path.join(__dirname, '../../data/products.json');
const productManager = new ProductManager(filePath);

// Listar todos los productos
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10);
        const products = await productManager.getProducts();
        res.json(limit ? products.slice(0, limit) : products);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Obtener un producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(parseInt(req.params.pid, 10));
        if (product) {
            res.json(product);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Actualizar un producto por ID
router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(parseInt(req.params.pid, 10), req.body);
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Eliminar un producto por ID
router.delete('/:pid', async (req, res) => {
    try {
        await productManager.deleteProduct(parseInt(req.params.pid, 10));
        res.send('Producto eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
