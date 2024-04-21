// src/api/carts/cartsRouter.js
const express = require('express');
const cartController = require('../../controllers/cartController');
const Cart = require('../../dao/models/CartSchema');
const Product = require('../../dao/models/ProductSchema');
const Ticket = require('../../dao/models/TicketSchema');
const User = require('../../dao/models/UserSchema');
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
router.post('/:cid/purchase', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.productId');
        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        let totalAmount = 0;
        const productsWithInsufficientStock = [];
        const updatedCartProducts = [];

        for (const item of cart.products) {
            const product = item.productId;
            if (item.quantity <= product.stock) {
                totalAmount += item.quantity * product.price;
                product.stock -= item.quantity;
                await product.save();
            } else {
                productsWithInsufficientStock.push(product._id);
                updatedCartProducts.push(item);
            }
        }

        cart.products = updatedCartProducts;
        await cart.save();

        if (productsWithInsufficientStock.length === 0) {
            const purchaser = await User.findById(cart.user);
            const ticket = new Ticket({
                code: Math.random().toString(36).substr(2, 9),
                purchase_datetime: new Date(),
                amount: totalAmount,
                purchaser: purchaser.email
            });
            await ticket.save();

            res.render('purchase', {
                purchaseSuccess: true,
                ticketId: ticket._id,
                totalAmount: totalAmount,
                purchaseDate: ticket.purchase_datetime.toLocaleDateString("es-ES")
            });
        } else {
            res.render('purchase', {
                purchaseSuccess: false,
                unprocessedItems: productsWithInsufficientStock,
                cartId: req.params.cid
            });
        }
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).send('Failed to process purchase');
    }
});

module.exports = router;
