const ProductDAO = require('../dao/mongo/ProductDAO');
const ProductDTO = require('../dto/ProductDTO');

class ProductRepository {
    constructor() {
        this.productDao = new ProductDAO();
    }

    async addProduct(productData) {
        const product = await this.productDao.addProduct(productData);
        return new ProductDTO(product);
    }

    async getProducts(options) {
        const products = await this.productDao.getProducts(options);
        return {
            docs: products.docs.map(product => new ProductDTO(product)),
            totalDocs: products.totalDocs,
            limit: products.limit,
            totalPages: products.totalPages,
            page: products.page,
            pagingCounter: products.pagingCounter,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevPage: products.prevPage,
            nextPage: products.nextPage
        };
    }

    async getProductById(productId) {
        const product = await this.productDao.getProductById(productId);
        return new ProductDTO(product);
    }

    async updateProduct(productId, productData) {
        const product = await this.productDao.updateProduct(productId, productData);
        return new ProductDTO(product);
    }

    async deleteProduct(productId) {
        await this.productDao.deleteProduct(productId);
        // Typically no need to return a DTO after deletion, just confirm deletion happened
        return { message: 'Producto eliminado correctamente' };
    }
}

module.exports = ProductRepository;
