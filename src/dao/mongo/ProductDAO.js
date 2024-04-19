// src/dao/mongo/ProductDAO.js
const Product = require('../models/ProductSchema');
const mongoosePaginate = require('mongoose-paginate-v2');

class ProductDAO {
    constructor() {}

    // Método para agregar un producto
    async addProduct(productData) {
        const product = new Product(productData);
        await product.save();
        return product;
    }

    // Método para obtener todos los productos con paginación y filtrado
    async getProducts({ limit = 10, page = 1, sort = '', query = '' }) {
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
        };

        let queryFilter = {};
        try {
            queryFilter = query ? JSON.parse(query) : {};
            // Extender el filtrado aquí
            if (queryFilter.categoria) {
                queryFilter['categoria'] = queryFilter.categoria;
            }
            if (queryFilter.disponibilidad) {
                queryFilter['stock'] = { $gt: 0 };
            }
        } catch (error) {
            console.error("Error parsing query string to JSON", error);
        }
        
        return await Product.paginate(queryFilter, options);
    }

    // Método para obtener un producto por ID
    async getProductById(productId) {
        return await Product.findById(productId);
    }

    // Método para actualizar un producto
    async updateProduct(productId, productData) {
        return await Product.findByIdAndUpdate(productId, productData, { new: true });
    }

    // Método para eliminar un producto
    async deleteProduct(productId) {
        await Product.findByIdAndDelete(productId);
        return { message: 'Producto eliminado correctamente' };
    }
}

module.exports = ProductDAO;
