
const fs = require('fs');

class ProductManager {
    constructor(filePath) {
        this.path = filePath;
        this.products = this.loadProducts() || [];
        this.nextId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id), 0) + 1 : 1;
    }

    // Load products from the file
    loadProducts() {
        if (fs.existsSync(this.path)) {
            return JSON.parse(fs.readFileSync(this.path));
        }
        return [];
    }

    // Save products to the file
    saveProducts() {
        fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
    }

    // Method to add a product
    addProduct({ title, description, price, thumbnail, code, stock }) {
        // Validaciones
        if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
            throw new Error('El stock debe ser un número entero positivo.');
    }

        if (typeof title !== 'string' || title.length === 0) {
            throw new Error('El título no debe estar vacío.');
        }
        const product = {
            id: this.nextId++,
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        };
        this.products.push(product);
        this.saveProducts();
        return product;
    }

    // Method to get all products
    getProducts() {
        return this.products;
    }

    // Method to get a product by id
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    // Method to update a product
    updateProduct(id, updatedProduct) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            return null;
        }
        this.products[index] = { ...this.products[index], ...updatedProduct };
        this.saveProducts();
        return this.products[index];
    }

    // Method to delete a product
    deleteProduct(id) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            return false;
        }
        this.products.splice(index, 1);
        this.saveProducts();
        return true;
    }
}

module.exports = ProductManager;
