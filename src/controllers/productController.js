// src/controllers/productController.js
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
                products: productDTOs,
                user: req.user
            });
            logger.info('Products retrieved successfully');
        } catch (error) {
            logger.error('Failed to retrieve products', { error: error.message });
            res.status(error.statusCode || 500).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    addProduct: async (req, res) => {
        logger.debug('Received data for new product:', JSON.stringify(req.body, null, 2));
        const { title, description, price, thumbnail, code, stock } = req.body;
        const { role, email } = req.user;

        try {
            if (!title || !price) {
                throw new Error(INVALID_PRODUCT_DATA.message);
            }

            // Verificar permisos para crear el producto
            if (role !== 'admin' && role !== 'premium') {
                return res.status(403).json({ message: 'Only admin or premium users can create products.' });
            }

            const newProduct = {
                title,
                description,
                price,
                thumbnail,
                code,
                stock,
                owner: role === 'admin' ? null : email // Asignar el correo electrónico como dueño
            };

            logger.debug('New product data:', JSON.stringify(newProduct, null, 2));

            const savedProduct = await productDAO.addProduct(newProduct);
            logger.info('Product added successfully', { productId: savedProduct._id });
            res.status(201).json(savedProduct);
        } catch (error) {
            logger.error('Error adding product', { error: error.message });
            res.status(error.statusCode || 500).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    updateProduct: async (req, res) => {
        const { id } = req.params;
        const { role, email } = req.user;
        const updateFields = req.body;

        try {
            const product = await productDAO.getProductById(id);
            if (!product) {
                throw new Error(PRODUCT_NOT_FOUND.message);
            }

            // Verificar permisos para actualizar el producto
            if (role !== 'admin' && product.owner && product.owner !== email) {
                return res.status(403).json({ message: 'You can only update your own products.' });
            }

            Object.assign(product, updateFields);
            await product.save();

            const productDTO = new ProductDTO(product);
            res.json(productDTO);
            logger.info('Product updated successfully', { productId: id });
        } catch (error) {
            logger.error('Failed to update product', { productId: id, error: error.message });
            res.status(error.statusCode || 500).send(error.message || PRODUCT_NOT_FOUND.message);
        }
    },

    deleteProduct: async (req, res) => {
        const { id } = req.params;
        const { role, email } = req.user;

        try {
            const product = await productDAO.getProductById(id);
            if (!product) {
                throw new Error(PRODUCT_NOT_FOUND.message);
            }

            // Verificar permisos para eliminar el producto
            logger.debug('Checking permissions to delete product:', {
                productId: id,
                productOwner: product.owner,
                userEmail: email,
                role: role
            });

            if (role !== 'admin' && product.owner && product.owner !== email) {
                logger.warn('Unauthorized attempt to delete product', {
                    productId: id,
                    productOwner: product.owner,
                    userEmail: email,
                    userRole: role
                });
                return res.status(403).json({ message: 'You can only delete your own products.' });
            }

            await productDAO.deleteProduct(id);
            res.send('Product deleted successfully');
            logger.info('Product deleted successfully', { productId: id });
        } catch (error) {
            logger.error('Failed to delete product', { productId: id, error: error.message });
            res.status(error.statusCode || 500).send(error.message || PRODUCT_NOT_FOUND.message);
        }
    }
};

module.exports = productController;
