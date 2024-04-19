const CartDAO = require('../dao/mongo/CartDAO');
const CartDTO = require('../dto/CartDTO');
const mongoose = require('mongoose');

const cartDAO = new CartDAO();

const cartController = {
    createCart: async (req, res) => {
        try {
            // Asumiendo que el ID del usuario viene en el cuerpo de la solicitud (body)
            const userId = req.body.userId;
            if (!userId) {
                return res.status(400).send("ID de usuario requerido");
            }
    
            const newCart = await cartDAO.createCart(userId);
            const cartDto = new CartDTO(newCart);
            res.cookie('cartId', newCart._id.toString());
            res.status(201).json(cartDto);
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
            const cartDto = new CartDTO(cart);
            res.render('cartDetails', { cart: cartDto });
        } catch (error) {
            res.status(500).send("Error al recuperar el carrito: " + error.message);
        }
    },

    addProductToCart: async (req, res) => {
        const { cid } = req.params;
        const { productId, quantity } = req.body; // Cambiar de req.params a req.body
    
        console.log(`Recibidos - Carrito ID: ${cid}, Producto ID: ${productId}, Cantidad: ${quantity}`);
    
        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(productId)) {
            console.log('Error: ID de carrito o producto no válido');
            return res.status(400).send('ID de carrito o producto no válido');
        }
    
        try {
            console.log(`Intentando añadir producto al carrito: ${productId} al carrito: ${cid}`);
            const updatedCart = await cartDAO.addProductToCart(cid, productId, quantity);
            const cartDto = new CartDTO(updatedCart);
            console.log(`Producto añadido exitosamente al carrito: ${cid}`);
            res.json(cartDto);
        } catch (error) {
            console.error(`Error al agregar producto al carrito: ${error.message}`);
            res.status(500).send("Error al agregar producto al carrito: " + error.message);
        }
    },
    

    removeProductFromCart: async (req, res) => {
        const { cid, pid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).send('ID de carrito o producto no válido');
        }

        try {
            const updatedCart = await cartDAO.removeProductFromCart(cid, pid);
            const cartDto = new CartDTO(updatedCart);
            res.json(cartDto);
        } catch (error) {
            res.status(500).send("Error al remover producto del carrito: " + error.message);
        }
    },

    updateCartProducts: async (req, res) => {
        const { cid } = req.params;
        const { products } = req.body;
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).send('ID de carrito no válido');
        }

        try {
            const updatedCart = await cartDAO.updateCartProducts(cid, products);
            const cartDto = new CartDTO(updatedCart);
            res.json(cartDto);
        } catch (error) {
            res.status(500).send("Error al actualizar productos en el carrito: " + error.message);
        }
    },

    emptyCart: async (req, res) => {
        const { cid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).send('ID de carrito no válido');
        }

        try {
            const emptiedCart = await cartDAO.emptyCart(cid);
            const cartDto = new CartDTO(emptiedCart);
            res.json(cartDto);
        } catch (error) {
            res.status(500).send("Error al vaciar el carrito: " + error.message);
        }
    },
};

module.exports = cartController;
