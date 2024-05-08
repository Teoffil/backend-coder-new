// src/api/products/productsRouter.js
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve a list of products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete an existing product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/products/mockingproducts:
 *   get:
 *     summary: Generate a list of mock products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of mock products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

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
