const express = require('express');
// Asegúrate de ajustar esta ruta a la ubicación real de tu ProductManager
const productManager = require('../../dao/mongo/productManager');
const router = express.Router();

// Listar todos los productos con soporte para paginación y filtrado
router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;
    try {
        const options = { limit, page, sort, query };
        const products = await productManager.getProducts(options);
        res.json(products);
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
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(req.params.id, req.body);
        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send('ID de producto inválido');
        }
        res.status(500).send(error.message);
    }
});

// Eliminar un producto por ID
router.delete('/:id', async (req, res) => {
    try {
        const result = await productManager.deleteProduct(req.params.id);
        if (result) {
            res.send('Producto eliminado');
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send('ID de producto inválido');
        }
        res.status(500).send(error.message);
    }
});

module.exports = router;
