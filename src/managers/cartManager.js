const fs = require('fs').promises;

class CartManager {
    constructor(filePath) {
        this.path = filePath;
        this.init();
    }

    async init() {
        try {
            this.carts = await this.loadCarts();
            this.nextId = this.carts.length > 0 ? Math.max(...this.carts.map(c => c.id)) + 1 : 1;
        } catch (error) {
            this.carts = [];
            this.nextId = 1;
        }
    }

    async loadCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error('Error al cargar carritos: ' + error.message);
        }
    }

    async saveCarts() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            throw new Error('Error al guardar carritos: ' + error.message);
        }
    }

    async createCart() {
        const newCart = {
            id: this.nextId++,
            products: []
        };
        this.carts.push(newCart);
        await this.saveCarts();
        return newCart;
    }

    async getCartById(id) {
        return this.carts.find(c => c.id === id);
    }

    async addProductToCart(cartId, productId) {
        const cart = this.carts.find(c => c.id === cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        const productIndex = cart.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ id: productId, quantity: 1 });
        }
        await this.saveCarts();
        return cart;
    }
}

module.exports = CartManager;
