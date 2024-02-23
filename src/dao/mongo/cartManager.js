const Cart = require('../models/CartSchema');

class CartManager {
    constructor() {}

    async createCart() {
        const cart = new Cart();
        await cart.save();
        return cart;
    }

    async getCartById(cartId) {
        const cart = await Cart.findById(cartId).populate('products.productId');
        return cart;
    }

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

    async removeProductFromCart(cartId, productId) {
        const cart = await Cart.findById(cartId);
        if (!cart) throw new Error('Carrito no encontrado');

        cart.products = cart.products.filter(item => item.productId.toString() !== productId);
        await cart.save();

        return cart;
    }

    async emptyCart(cartId) {
        const cart = await Cart.findById(cartId);
        cart.products = [];
        await cart.save();
        return cart;
    }

    async updateCartProducts(cartId, products) {
        const cart = await Cart.findById(cartId);
        if (!cart) throw new Error('Carrito no encontrado');

        // Reemplaza el arreglo de productos existente con el nuevo
        cart.products = products;

        await cart.save();
        return cart;
    }

    // Nuevo método para actualizar la cantidad de un producto específico
    async updateProductQuantity(cartId, productId, quantity) {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);
        if (productIndex === -1) {
            throw new Error('Producto no encontrado en el carrito');
        }

        cart.products[productIndex].quantity = quantity;

        await cart.save();
        return cart;
    }
}

module.exports = CartManager;

