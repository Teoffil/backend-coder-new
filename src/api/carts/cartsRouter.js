// src/api/carts/cartsRouter.js
/**
 * @swagger
 * tags:
 *   name: Carts
 *   description: Cart management
 */

/**
 * @swagger
 * /api/carts:
 *   post:
 *     summary: Create a new cart
 *     tags: [Carts]
 *     responses:
 *       201:
 *         description: Cart created successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/carts/{cid}:
 *   get:
 *     summary: Retrieve products in a specific cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: The cart ID
 *     responses:
 *       200:
 *         description: A list of products in the cart.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/carts/{cartId}/products/{productId}:
 *   post:
 *     summary: Add a product to a cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *         description: The cart ID
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the product to add
 *                 example: 1
 *     responses:
 *       200:
 *         description: Product added successfully
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Cart or product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/carts/{cartId}/products/{productId}:
 *   delete:
 *     summary: Remove a product from a cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *         description: The cart ID
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product removed successfully
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Cart or product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/carts/{cartId}:
 *   put:
 *     summary: Update the cart with an array of products
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *         description: The cart ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: The product ID
 *                     quantity:
 *                       type: integer
 *                       description: The quantity of the product
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/carts/{cartId}:
 *   delete:
 *     summary: Empty the cart (remove all products)
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *         description: The cart ID
 *     responses:
 *       200:
 *         description: Cart emptied successfully
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/carts/{cartId}/purchase:
 *   post:
 *     summary: Complete the purchase of a cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *         description: The cart ID
 *     responses:
 *       200:
 *         description: Purchase completed successfully
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */

const express = require('express');
const cartController = require('../../controllers/cartController');
const { authorize } = require('../../middleware/authorization');
const router = express.Router();

// Crear un nuevo carrito
router.post('/', cartController.createCart);

// Listar productos en un carrito específico
router.get('/:cid', cartController.getCartById);

// Agregar un producto al carrito con autorización de "usuario", "admin" o "premium"
router.post('/:cartId/products/:productId', authorize(['user', 'admin', 'premium']), cartController.addProductToCart);

// Eliminar un producto específico del carrito
router.delete('/:cartId/products/:productId', cartController.removeProductFromCart);

// Actualizar el carrito con un arreglo de productos
router.put('/:cartId', cartController.updateCartProducts);

// Vaciar el carrito (eliminar todos los productos)
router.delete('/:cartId', cartController.emptyCart);

// Ruta para finalizar la compra de un carrito
router.post('/:cartId/purchase', authorize(['user', 'admin', 'premium']), cartController.purchaseCart);

module.exports = router;
