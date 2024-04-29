const ProductDAO = require('../dao/mongo/ProductDAO');
const ProductDTO = require('../dto/ProductDTO');
const logger = require('../config/logger'); 
const {
    PRODUCT_NOT_FOUND,
    INTERNAL_SERVER_ERROR,
    INVALID_PRODUCT_DATA
} = require('../utils/errorMessages');

const productDAO = new ProductDAO();

const productController = {
    getAllProducts: async (req, res) => {
        const { limit = 10, page = 1, sort = '', query = '' } = req.query;
        try {
            const options = { limit: parseInt(limit), page: parseInt(page), sort, query };
            const products = await productDAO.getProducts(options);
            if (!products || products.docs.length === 0) {
                throw new Error(PRODUCT_NOT_FOUND.message);
            }
            const productDTOs = products.docs.map(product => new ProductDTO(product));
            res.render('products', {
                products: productDTOs, // Send DTOs instead of raw data
                user: req.user,
            });
            logger.info('Products retrieved successfully');
        } catch (error) {
            logger.error('Failed to retrieve products', { error: error.message });
            res.status(error.statusCode || 500).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    addProduct: async (req, res) => {
        logger.debug("Received data for new product:", req.body);
        try {
            if (!req.body.name || !req.body.price) {
                throw new Error(INVALID_PRODUCT_DATA.message);
            }
            const savedProduct = await productDAO.addProduct(req.body);
            logger.info("Product added successfully", { productId: savedProduct._id });
            res.status(201).json(savedProduct);
        } catch (error) {
            logger.error("Error adding product", { error: error.message });
            res.status(error.statusCode || 500).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    updateProduct: async (req, res) => {
        const { id } = req.params;
        try {
            const updatedProduct = await productDAO.updateProduct(id, req.body);
            if (!updatedProduct) {
                throw new Error(PRODUCT_NOT_FOUND.message);
            }
            const productDTO = new ProductDTO(updatedProduct);
            res.json(productDTO);
            logger.info('Product updated successfully', { productId: id });
        } catch (error) {
            logger.error('Failed to update product', { productId: id, error: error.message });
            res.status(error.statusCode || 500).send(error.message || PRODUCT_NOT_FOUND.message);
        }
    },

    deleteProduct: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await productDAO.deleteProduct(id);
            if (!result) {
                throw new Error(PRODUCT_NOT_FOUND.message);
            }
            res.send('Producto eliminado');
            logger.info('Product deleted successfully', { productId: id });
        } catch (error) {
            logger.error('Failed to delete product', { productId: id, error: error.message });
            res.status(error.statusCode || 500).send(error.message || PRODUCT_NOT_FOUND.message);
        }
    },
};

module.exports = productController;
