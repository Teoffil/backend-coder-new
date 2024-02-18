const express = require('express');
const CartManager = require('../../dao/mongo/CartManager'); // Asegúrate de que la ruta es correcta
const router = express.Router();

// No necesitas el path.join(__dirname, '..', '..', 'data', 'carts.json') para CartManager en MongoDB
const cartManager = new CartManager();

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Listar productos en un carrito específico
router.get('/:cid', async (req, res) => {
    try {
        // Aquí asumimos que getCartById usa el _id de MongoDB, no parseInt
        const cart = await cartManager.getCartById(req.params.cid);
        if (cart) {
            res.json(cart.products);
        } else {
            res.status(404).send('Carrito no encontrado');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Agregar un producto al carrito
// Se ajustó la ruta para coincidir con tu solicitud POST: '/:cid/products'
router.post('/:cid/products', async (req, res) => {
    try {
        // Asumiendo que addProductToCart espera el _id del carrito y el objeto del producto con su _id y cantidad
        const updatedCart = await cartManager.addProductToCart(req.params.cid, req.body.productId, req.body.quantity);
        res.json(updatedCart);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
