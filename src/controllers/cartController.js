// src/controllers/cartController.js
const CartDAO = require('../dao/mongo/CartDAO');
const ProductDAO = require('../dao/mongo/ProductDAO');
const TicketDAO = require('../dao/mongo/TicketDAO');
const mongoose = require('mongoose');
const logger = require('../config/logger');
const emailService = require('../utils/emailService');

const {
    CART_NOT_FOUND,
    INVALID_REQUEST,
    INTERNAL_SERVER_ERROR,
    PRODUCT_NOT_FOUND,
    PRODUCT_OUT_OF_STOCK
} = require('../utils/errorMessages');

const cartDAO = new CartDAO();
const productDAO = new ProductDAO();
const ticketDAO = new TicketDAO();

const cartController = {
    createCart: async (req, res) => {
        try {
            const userId = req.user.id; // Obtener userId del token de usuario si está disponible
            if (!userId) {
                throw new Error(INVALID_REQUEST.message);
            }
            const newCart = await cartDAO.createCart(userId);
            logger.debug('New cart created', { userId });
            res.cookie('cartId', newCart._id.toString());
            res.status(201).json(newCart);
        } catch (error) {
            logger.error('Error creating cart', { error: error.message });
            error.statusCode = error.statusCode || 500;
            res.status(error.statusCode).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    getCartById: async (req, res) => {
        try {
            const { cid } = req.params;
            if (!mongoose.Types.ObjectId.isValid(cid)) {
                throw new Error(INVALID_REQUEST.message);
            }
            const cart = await cartDAO.getCartById(cid);
            if (!cart) {
                throw new Error(CART_NOT_FOUND.message);
            }
            logger.info('Cart retrieved successfully', { cid });
            res.render('cartDetails', { cart }); // Renderiza la vista cartDetails.handlebars con los datos del carrito
        } catch (error) {
            logger.error('Error retrieving cart', { cid: req.params.cid, error: error.message });
            error.statusCode = error.statusCode || 500;
            res.status(error.statusCode).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    addProductToCart: async (req, res) => {
        const { cartId, productId } = req.params;

        try {
            const cart = await cartDAO.getCartById(cartId);
            if (!cart) {
                return res.status(404).json({ message: 'Carrito no encontrado.' });
            }

            const product = await productDAO.getProductById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Producto no encontrado.' });
            }

            const updatedCart = await cartDAO.addProductToCart(cartId, productId, 1);
            res.json(updatedCart);
        } catch (error) {
            console.error('Error adding product to cart:', error);
            res.status(500).json({ message: 'Error al agregar el producto al carrito.' });
        }
    },

    removeProductFromCart: async (req, res) => {
        const { cartId, productId } = req.params;
        try {
            const updatedCart = await cartDAO.removeProductFromCart(cartId, productId);
            if (!updatedCart) {
                throw new Error(CART_NOT_FOUND.message);
            }
            logger.info('Product removed from cart successfully', { cartId, productId });
            res.json(updatedCart);
        } catch (error) {
            logger.error('Error removing product from cart', { cartId, productId, error: error.message });
            error.statusCode = error.statusCode || 500;
            res.status(error.statusCode).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    updateCartProducts: async (req, res) => {
        const { cartId, products } = req.body;
        try {
            const updatedCart = await cartDAO.updateCartProducts(cartId, products);
            logger.info('Cart products updated successfully', { cartId });
            res.json(updatedCart);
        } catch (error) {
            logger.error('Error updating cart products', { cartId, error: error.message });
            error.statusCode = error.statusCode || 500;
            res.status(error.statusCode).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    emptyCart: async (req, res) => {
        const { cartId } = req.params;
        try {
            const emptiedCart = await cartDAO.emptyCart(cartId);
            logger.info('Cart emptied successfully', { cartId });
            res.json(emptiedCart);
        } catch (error) {
            logger.error('Error emptying cart', { cartId, error: error.message });
            error.statusCode = error.statusCode || 500;
            res.status(error.statusCode).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    confirmPurchase: async (req, res) => {
        try {
            const cart = await cartDAO.getCartById(req.params.cartId);
            if (!cart) {
                throw new Error(CART_NOT_FOUND.message);
            }

            let totalAmount = 0;
            const productsWithInsufficientStock = [];

            for (const item of cart.products) {
                const product = await productDAO.getProductById(item.productId);
                if (item.quantity > product.stock) {
                    productsWithInsufficientStock.push(product._id);
                }
                totalAmount += item.quantity * product.price;
            }

            res.render('purchase', {
                cartId: cart._id,
                totalAmount,
                productsWithInsufficientStock
            });
        } catch (error) {
            logger.error('Error confirming purchase', { cartId: req.params.cartId, error: error.message });
            res.status(error.statusCode || 500).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    purchaseCart: async (req, res) => {
        try {
            const cart = await cartDAO.getCartById(req.params.cartId);
            if (!cart) {
                throw new Error(CART_NOT_FOUND.message);
            }

            let totalAmount = 0;
            const productsWithInsufficientStock = [];
            const updatedCartProducts = [];

            for (const item of cart.products) {
                const product = await productDAO.getProductById(item.productId);
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
                const ticket = await ticketDAO.createTicket({
                    amount: totalAmount,
                    purchaser: cart.user
                });

                // Verificar si el correo electrónico del usuario está disponible
                const purchaserEmail = cart.user.email;
                if (!purchaserEmail) {
                    throw new Error('El correo electrónico del comprador no está definido.');
                }

                // Enviar correo de confirmación del pedido
                await emailService.sendTicketEmail(purchaserEmail, ticket);

                logger.info('Purchase successful', { cartId: req.params.cartId, ticketId: ticket._id });
                res.redirect(`/ticket/${ticket._id}`);
            } else {
                logger.warn('Purchase failed due to insufficient stock', { cartId: req.params.cartId });
                res.status(400).json({ success: false, unprocessedItems: productsWithInsufficientStock });
            }
        } catch (error) {
            logger.error('Purchase error', { cartId: req.params.cartId, error: error.message });
            error.statusCode = error.statusCode || 500;
            res.status(error.statusCode).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },
};

module.exports = cartController;
