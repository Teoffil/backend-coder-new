const CartDAO = require('../dao/mongo/CartDAO');
const CartDTO = require('../dto/CartDTO');

class CartRepository {
    constructor() {
        this.cartDao = new CartDAO();
    }

    async createCart(userId) {
        const cart = await this.cartDao.createCart(userId);
        return new CartDTO(cart);
    }

    async getCartById(cartId) {
        const cart = await this.cartDao.getCartById(cartId);
        return new CartDTO(cart);
    }

    async addProductToCart(cartId, productId, quantity) {
        const cart = await this.cartDao.addProductToCart(cartId, productId, quantity);
        return new CartDTO(cart);
    }

    async removeProductFromCart(cartId, productId) {
        const cart = await this.cartDao.removeProductFromCart(cartId, productId);
        return new CartDTO(cart);
    }

    async emptyCart(cartId) {
        const cart = await this.cartDao.emptyCart(cartId);
        return new CartDTO(cart);
    }

    async updateCartProducts(cartId, products) {
        const cart = await this.cartDao.updateCartProducts(cartId, products);
        return new CartDTO(cart);
    }

    async updateProductQuantity(cartId, productId, quantity) {
        const cart = await this.cartDao.updateProductQuantity(cartId, productId, quantity);
        return new CartDTO(cart);
    }
}

module.exports = CartRepository;
