const CartDAO = require('../dao/mongo/CartDAO');
const ProductDAO = require('../dao/mongo/ProductDAO');
const TicketDAO = require('../dao/mongo/TicketDAO');
const mongoose = require('mongoose');
const logger = require('../config/logger'); 
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
            const userId = req.body.userId;
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
            res.json(cart);
        } catch (error) {
            logger.error('Error retrieving cart', { cid: req.params.cid, error: error.message });
            error.statusCode = error.statusCode || 500;
            res.status(error.statusCode).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    addProductToCart: async (req, res) => {
        try {
            const { cid, productId, quantity } = req.body;
            if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error(INVALID_REQUEST.message);
            }
            const updatedCart = await cartDAO.addProductToCart(cid, productId, quantity);
            if (!updatedCart) {
                throw new Error(CART_NOT_FOUND.message);
            }
            logger.info('Product added to cart successfully', { cid, productId, quantity });
            res.json(updatedCart);
        } catch (error) {
            logger.error('Error adding product to cart', { cid: req.body.cid, productId: req.body.productId, error: error.message });
            error.statusCode = error.statusCode || 500;
            res.status(error.statusCode).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    removeProductFromCart: async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const updatedCart = await cartDAO.removeProductFromCart(cid, pid);
            if (!updatedCart) {
                throw new Error(CART_NOT_FOUND.message);
            }
            logger.info('Product removed from cart successfully', { cid, pid });
            res.json(updatedCart);
        } catch (error) {
            logger.error('Error removing product from cart', { cid: req.params.cid, pid: req.params.pid, error: error.message });
            error.statusCode = error.statusCode || 500;
            res.status(error.statusCode).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    updateCartProducts: async (req, res) => {
        try {
            const { cid, products } = req.body;
            const updatedCart = await cartDAO.updateCartProducts(cid, products);
            logger.info('Cart products updated successfully', { cid });
            res.json(updatedCart);
        } catch (error) {
            logger.error('Error updating cart products', { cid: req.body.cid, error: error.message });
            error.statusCode = error.statusCode || 500;
            res.status(error.statusCode).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    emptyCart: async (req, res) => {
        try {
            const { cid } = req.params;
            const emptiedCart = await cartDAO.emptyCart(cid);
            logger.info('Cart emptied successfully', { cid });
            res.json(emptiedCart);
        } catch (error) {
            logger.error('Error emptying cart', { cid: req.params.cid, error: error.message });
            error.statusCode = error.statusCode || 500;
            res.status(error.statusCode).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    purchaseCart: async (req, res) => {
        try {
            const cart = await cartDAO.getCartById(req.params.cid);
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

                logger.info('Purchase successful', { cid: req.params.cid, ticketId: ticket._id });
                res.json({
                    success: true,
                    ticketId: ticket._id,
                    code: ticket.code,
                    purchaseDatetime: ticket.purchase_datetime,
                    amount: ticket.amount,
                    purchaser: ticket.purchaser
                });
            } else {
                logger.warn('Purchase failed due to insufficient stock', { cid: req.params.cid });
                res.status(400).json({ success: false, unprocessedItems: productsWithInsufficientStock });
            }
        } catch (error) {
            logger.error('Purchase error', { cid: req.params.cid, error: error.message });
            error.statusCode = error.statusCode || 500;
            res.status(error.statusCode).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    }
};

module.exports = cartController;
