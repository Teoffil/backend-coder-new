// src/api/carts/cartsRouter.js
const express = require('express');
const cartController = require('../../controllers/cartController');
const { authorize } = require('../../middleware/authorization');
const router = express.Router();

// Crear un nuevo carrito
router.post('/', cartController.createCart);

// Listar productos en un carrito específico
router.get('/:cid', cartController.getCartById);

// Agregar un producto al carrito con autorización de "usuario", "admin" o "premium"
router.post('/:cartId/products/:productId', authorize(['usuario', 'admin', 'premium']), cartController.addProductToCart);

// Eliminar un producto específico del carrito
router.delete('/:cartId/products/:productId', cartController.removeProductFromCart);

// Actualizar el carrito con un arreglo de productos
router.put('/:cartId', cartController.updateCartProducts);

// Vaciar el carrito (eliminar todos los productos)
router.delete('/:cartId', cartController.emptyCart);

// Ruta para finalizar la compra de un carrito
router.post('/:cartId/purchase', authorize(['usuario', 'admin', 'premium']), cartController.purchaseCart);

module.exports = router;