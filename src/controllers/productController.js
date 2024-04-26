const ProductDAO = require('../dao/mongo/ProductDAO');
const ProductDTO = require('../dto/ProductDTO');
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
            if (!products) {
                throw new Error(PRODUCT_NOT_FOUND.message);
            }
            const productDTOs = products.docs.map(product => new ProductDTO(product));
            res.render('products', {
                products: productDTOs, // Send DTOs instead of raw data
                user: req.user,
            });
        } catch (error) {
            res.status(error.statusCode || 500).send(error.message || INTERNAL_SERVER_ERROR.message);
        }
    },

    addProduct: async (req, res) => {
        console.log("Headers:", req.headers);  // Esto mostrará todos los headers de la solicitud
        console.log("Received data for new product:", req.body);  // Esto mostrará el cuerpo de la solicitud

        try {
            if (!req.body.name || !req.body.price) {
                throw new Error(INVALID_PRODUCT_DATA.message);
            }
            const savedProduct = await productDAO.addProduct(req.body);
            console.log("Saved product details:", savedProduct);
            res.status(201).json(savedProduct);
        } catch (error) {
            console.error("Error al añadir producto:", error);
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
        } catch (error) {
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
        } catch (error) {
            res.status(error.statusCode || 500).send(error.message || PRODUCT_NOT_FOUND.message);
        }
    },
};

module.exports = productController;
