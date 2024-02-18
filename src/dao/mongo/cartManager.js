const Cart = require('../models/CartSchema');

class CartManager {
    constructor() {}

    // Crear un nuevo carrito
    async createCart() {
        const cart = new Cart();
        await cart.save();
        return cart;
    }

    // Obtener un carrito por ID
    async getCartById(cartId) {
        const cart = await Cart.findById(cartId).populate('products.productId');
        return cart;
    }

    // Agregar un producto al carrito
    async addProductToCart(cartId, productId, quantity) {
        const cart = await Cart.findById(cartId);
        if (!cart) throw new Error('Carrito no encontrado');

        const productIndex = cart.products.findIndex(item => item.productId.toString() === productId.toString());

        if (productIndex > -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ productId, quantity });
        }

        await cart.save();
        return cart;
    }

    // Eliminar un producto del carrito
    async removeProductFromCart(cartId, productId) {
        const cart = await Cart.findById(cartId);
        if (!cart) throw new Error('Carrito no encontrado');

        cart.products = cart.products.filter(item => item.productId.toString() !== productId.toString());
        await cart.save();
        return cart;
    }

    // Vaciar el carrito
    async emptyCart(cartId) {
        const cart = await Cart.findById(cartId);
        cart.products = [];
        await cart.save();
        return cart;
    }
}

module.exports = CartManager;
