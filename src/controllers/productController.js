const ProductDAO = require('../dao/mongo/ProductDAO');
const ProductDTO = require('../dto/ProductDTO');

const productDAO = new ProductDAO();

const productController = {
    getAllProducts: async (req, res) => {
        const { limit = 10, page = 1, sort = '', query = '' } = req.query;
        try {
            const options = { limit: parseInt(limit), page: parseInt(page), sort, query };
            const products = await productDAO.getProducts(options);
            const productDTOs = products.docs.map(product => new ProductDTO(product));
            res.render('products', {
                products: productDTOs, // Send DTOs instead of raw data
                user: req.user,
            });
        } catch (error) {
            res.status(500).send("Error al obtener productos: " + error.message);
        }
    },

    addProduct: async (req, res) => {
        try {
            const newProduct = await productDAO.addProduct(req.body);
            const productDTO = new ProductDTO(newProduct);
            res.status(201).json(productDTO);
        } catch (error) {
            res.status(500).send("Error al añadir producto: " + error.message);
        }
    },

    updateProduct: async (req, res) => {
        const { id } = req.params;
        try {
            const updatedProduct = await productDAO.updateProduct(id, req.body);
            if (updatedProduct) {
                const productDTO = new ProductDTO(updatedProduct);
                res.json(productDTO);
            } else {
                res.status(404).send('Producto no encontrado');
            }
        } catch (error) {
            res.status(500).send("Error al actualizar producto: " + error.message);
        }
    },

    deleteProduct: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await productDAO.deleteProduct(id);
            if (result) {
                res.send('Producto eliminado');
            } else {
                res.status(404).send('Producto no encontrado');
            }
        } catch (error) {
            res.status(500).send("Error al eliminar producto: " + error.message);
        }
    },
};

module.exports = productController;
