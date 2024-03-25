// src/api/products/productsRouter.js
const express = require('express');
const productController = require('../../controllers/productController'); 
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

// Agregar un nuevo producto
router.post('/', productController.addProduct);

// Actualizar un producto por ID
router.put('/:id', productController.updateProduct);

// Eliminar un producto por ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;
