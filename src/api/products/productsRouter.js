const express = require('express');
const ProductManager = require('../../dao/mongo/productManager'); // Asegúrate de que la ruta es correcta.
const router = express.Router();

const productManager = new ProductManager();

// Listar todos los productos
router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
        const products = await productManager.getAllProducts();
        res.json(limit ? products.slice(0, limit) : products);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Obtener un producto por ID usando el _id de MongoDB
router.get('/:id', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.id); // Cambiado para usar el _id de MongoDB directamente
        if (product) {
            res.json(product);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        // Modificado para manejar errores de casting de ObjectId
        if (error.name === 'CastError') {
            return res.status(400).send('ID de producto inválido');
        }
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
        const updatedProduct = await productManager.updateProduct(req.params.id, req.body); // Cambiado para usar el _id de MongoDB directamente
        if(updatedProduct) {
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
        const result = await productManager.deleteProduct(req.params.id); // Cambiado para usar el _id de MongoDB directamente
        if(result.deletedCount === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        res.send('Producto eliminado');
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send('ID de producto inválido');
        }
        res.status(500).send(error.message);
    }
});

module.exports = router;
