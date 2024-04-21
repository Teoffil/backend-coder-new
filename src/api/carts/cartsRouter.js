// src/api/carts/cartsRouter.js
const express = require('express');
const cartController = require('../../controllers/cartController');
const { authorize } = require('../../middleware/authorization');
const router = express.Router();

// Crear un nuevo carrito
router.post('/', cartController.createCart);

// Listar productos en un carrito específico
router.get('/:cid', cartController.getCartById);

// Agregar un producto al carrito
router.post('/:cid/products', authorize(['usuario']), cartController.addProductToCart);

// Eliminar un producto específico del carrito
router.delete('/:cid/products/:pid', cartController.removeProductFromCart);

// Actualizar el carrito con un arreglo de productos
router.put('/:cid', cartController.updateCartProducts);

// Vaciar el carrito (eliminar todos los productos)
router.delete('/:cid', cartController.emptyCart);

// Ruta para finalizar la compra de un carrito
router.post('/:cid/purchase', authorize(['usuario']), cartController.purchaseCart);

module.exports = router;
