const Product = require('../models/ProductSchema');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

Product.schema.plugin(mongoosePaginate);

class ProductManager {
    async addProduct(productData) {
        const product = new Product(productData);
        await product.save();
        return product;
    }

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
        
        const result = await Product.paginate(queryFilter, options);
        return {
            docs: result.docs,
            totalPages: result.totalPages,
            page: result.page,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            nextPage: result.nextPage,
            prevPage: result.prevPage
        };
    }

    async getProductById(productId) {
        return await Product.findById(productId);
    }

    async updateProduct(productId, productData) {
        return await Product.findByIdAndUpdate(productId, productData, { new: true });
    }

    async deleteProduct(productId) {
        await Product.findByIdAndDelete(productId);
        return { message: 'Producto eliminado correctamente' };
    }
}

module.exports = new ProductManager();
