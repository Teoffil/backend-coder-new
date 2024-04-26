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

// Agregar un nuevo producto con autorización de administrador
router.post('/', authorize('admin'), productController.addProduct);

// Actualizar un producto por ID con autorización de administrador
router.put('/:id', authorize('admin'), productController.updateProduct);

// Eliminar un producto por ID con autorización de administrador
router.delete('/:id', authorize('admin'), productController.deleteProduct);

//mocking
router.get('/mockingproducts', (req, res) => {
    res.json(generateProducts(100));
});

module.exports = router;
