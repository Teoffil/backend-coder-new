const Product = require('../models/ProductSchema');

class ProductManager {
    constructor() {}

    // Método para agregar un nuevo producto
    async addProduct(productData) {
        const product = new Product(productData);
        await product.save();
        return product;
    }

    // Método para obtener todos los productos
    async getAllProducts() {
        const products = await Product.find();
        return products;
    }

    // Método para obtener un producto por su ID
    async getProductById(productId) {
        const product = await Product.findById(productId);
        return product;
    }

    // Método para actualizar un producto por su ID
    async updateProduct(productId, productData) {
        const updatedProduct = await Product.findByIdAndUpdate(productId, productData, { new: true });
        return updatedProduct;
    }

    // Método para eliminar un producto por su ID
    async deleteProduct(productId) {
        await Product.findByIdAndDelete(productId);
        return { message: 'Producto eliminado correctamente' };
    }
}

module.exports = ProductManager;

