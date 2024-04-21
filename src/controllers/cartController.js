const CartDAO = require('../dao/mongo/CartDAO');
const ProductDAO = require('../dao/mongo/ProductDAO');
const TicketDAO = require('../dao/mongo/TicketDAO');
const mongoose = require('mongoose');

const cartDAO = new CartDAO();
const productDAO = new ProductDAO();
const ticketDAO = new TicketDAO();

const cartController = {
    createCart: async (req, res) => {
        try {
            const userId = req.body.userId;
            if (!userId) {
                return res.status(400).send("ID de usuario requerido");
            }
            const newCart = await cartDAO.createCart(userId);
            res.cookie('cartId', newCart._id.toString());
            res.status(201).json(newCart);
        } catch (error) {
            res.status(500).send("Error al crear el carrito: " + error.message);
        }
    },

    getCartById: async (req, res) => {
        const { cid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).send('ID de carrito no válido');
        }
        try {
            const cart = await cartDAO.getCartById(cid);
            if (!cart) {
                return res.status(404).send('Carrito no encontrado');
            }
            res.json(cart);
        } catch (error) {
            res.status(500).send("Error al recuperar el carrito: " + error.message);
        }
    },

    addProductToCart: async (req, res) => {
        const { cid } = req.params;
        const { productId, quantity } = req.body;
    
        console.log(`Carrito ID: ${cid}, Producto ID: ${productId}, Cantidad: ${quantity}`);
    
        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('ID de carrito o producto no válido');
        }
    
        try {
            const updatedCart = await cartDAO.addProductToCart(cid, productId, quantity);
            if (!updatedCart) {
                return res.status(404).send('Carrito no encontrado');
            }
            res.json(updatedCart);
        } catch (error) {
            console.error(`Error al agregar producto al carrito: ${error}`);
            res.status(500).send("Error al agregar producto al carrito: " + error.message);
        }
    },

    removeProductFromCart: async (req, res) => {
        const { cid, pid } = req.params;
        try {
            const updatedCart = await cartDAO.removeProductFromCart(cid, pid);
            res.json(updatedCart);
        } catch (error) {
            res.status(500).send("Error al remover producto del carrito: " + error.message);
        }
    },

    updateCartProducts: async (req, res) => {
        const { cid, products } = req.body;
        try {
            const updatedCart = await cartDAO.updateCartProducts(cid, products);
            res.json(updatedCart);
        } catch (error) {
            res.status(500).send("Error al actualizar productos en el carrito: " + error.message);
        }
    },

    emptyCart: async (req, res) => {
        const { cid } = req.params;
        try {
            const emptiedCart = await cartDAO.emptyCart(cid);
            res.json(emptiedCart);
        } catch (error) {
            res.status(500).send("Error al vaciar el carrito: " + error.message);
        }
    },

    purchaseCart: async (req, res) => {
        try {
            const cart = await cartDAO.getCartById(req.params.cid);
            if (!cart) {
                return res.status(404).send('Carrito no encontrado');
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
                    purchaser: cart.user  // Asegúrate de que cart.user contenga el ID o correo del usuario
                });

                // Incluir todos los datos del ticket en la respuesta
                res.json({
                    success: true,
                    ticketId: ticket._id,
                    code: ticket.code,
                    purchaseDatetime: ticket.purchase_datetime,
                    amount: ticket.amount,
                    purchaser: ticket.purchaser
                });
            } else {
                res.status(400).json({ success: false, unprocessedItems: productsWithInsufficientStock });
            }
        } catch (error) {
            console.error('Purchase error:', error);
            res.status(500).send('Failed to process purchase');
        }
    }
};

module.exports = cartController;
