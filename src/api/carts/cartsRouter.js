const express = require('express');
const CartManager = require('../../managers/cartManager'); // Asegúrate de que la ruta sea correcta
const router = express.Router();
const path = require('path');
const cartManager = new CartManager(path.join(__dirname, '..', '..', 'data', 'carts.json'));

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
        const cart = await cartManager.getCartById(parseInt(req.params.cid, 10));
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
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const updatedCart = await cartManager.addProductToCart(parseInt(req.params.cid, 10), parseInt(req.params.pid, 10));
        res.json(updatedCart);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
