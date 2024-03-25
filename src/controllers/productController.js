const User = require('../dao/models/UserSchema');
const productManager = require('../dao/mongo/productManager');

const productController = {
    getAllProducts: async (req, res) => {
        const { limit = 10, page = 1, sort, query } = req.query;
        try {
            const options = { limit, page, sort, query };
            const products = await productManager.getProducts(options);
            res.render('products', {
                products: products.docs,
                user: req.user,
            });
        } catch (error) {
            res.status(500).send(error.message);
        }
    },

    addProduct: async (req, res) => {
        try {
            const newProduct = await productManager.addProduct(req.body);
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).send(error.message);
        }
    },

    updateProduct: async (req, res) => {
        try {
            const updatedProduct = await productManager.updateProduct(req.params.id, req.body);
            if (updatedProduct) {
                res.json(updatedProduct);
            } else {
                res.status(404).send('Producto no encontrado');
            }
        } catch (error) {
            if (error.name === 'CastError') {
                res.status(400).send('ID de producto inválido');
            } else {
                res.status(500).send(error.message);
            }
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const result = await productManager.deleteProduct(req.params.id);
            if (result) {
                res.send('Producto eliminado');
            } else {
                res.status(404).send('Producto no encontrado');
            }
        } catch (error) {
            if (error.name === 'CastError') {
                res.status(400).send('ID de producto inválido');
            } else {
                res.status(500).send(error.message);
            }
        }
    },
};

module.exports = productController;
