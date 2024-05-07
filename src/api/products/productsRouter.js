// src/api/products/productsRouter.js
const express = require('express');
const productController = require('../../controllers/productController');
const { authorize } = require('../../middleware/authorization');
const User = require('../../dao/models/UserSchema');
const { generateProducts } = require('../../utils/mockData');
const router = express.Router();

// Middleware para cargar el usuario
router.use(async (req, res, next) => {
    if (req.session.userId) {
        req.user = await User.findById(req.session.userId);
    }
    next();
});

// Listar todos los productos
router.get('/', productController.getAllProducts);

// Agregar un nuevo producto con autorización de "premium" o "admin"
router.post('/', authorize(['admin', 'premium']), productController.addProduct);

// Actualizar un producto por ID con autorización de "premium" o "admin"
router.put('/:id', authorize(['admin', 'premium']), productController.updateProduct);

// Eliminar un producto por ID con autorización de "premium" o "admin"
router.delete('/:id', authorize(['admin', 'premium']), productController.deleteProduct);

// Mocking de productos
router.get('/mockingproducts', (req, res) => {
    res.json(generateProducts(100));
});

module.exports = router;
