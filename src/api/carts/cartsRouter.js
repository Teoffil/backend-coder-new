const express = require('express');
const CartManager = require('../../dao/mongo/cartManager'); // Asegúrate de que la ruta sea correcta
const router = express.Router();
const mongoose = require('mongoose');

const cartManager = new CartManager();

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        // Guarda el ID del carrito en una cookie
        res.cookie('cartId', newCart._id.toString());
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Listar productos en un carrito específico
router.get('/:cid', async (req, res) => {
    const cartId = req.params.cid;

    // Verificar si cartId es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
        return res.status(400).send('ID de carrito no válido');
    }

    try {
        const cart = await cartManager.getCartById(cartId);
        res.render('cartDetails', { cart }); // Asegúrate de tener la vista cartDetails.handlebars
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Agregar un producto al carrito
router.post('/:cid/products', async (req, res) => {
    try {
        const updatedCart = await cartManager.addProductToCart(req.params.cid, req.body.productId, req.body.quantity);
        res.json(updatedCart);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Eliminar un producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await cartManager.removeProductFromCart(req.params.cid, req.params.pid);
        res.json(cart);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Actualizar el carrito con un arreglo de productos
router.put('/:cid', async (req, res) => {
    try {
        const updatedCart = await cartManager.updateCartProducts(req.params.cid, req.body.products);
        res.json(updatedCart);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Vaciar el carrito (eliminar todos los productos)
router.delete('/:cid', async (req, res) => {
    try {
        const cart = await cartManager.emptyCart(req.params.cid);
        res.json(cart);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Eliminada la ruta GET no recomendada para producción

module.exports = router;
