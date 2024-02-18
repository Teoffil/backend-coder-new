const fs = require('fs').promises;

class ProductManager {
    constructor(filePath) {
        this.path = filePath;
        this.products = [];
        this.nextId = 1;
        this.init(); // Inicia la carga de productos
    }

    async init() {
        try {
            const productsLoaded = await this.loadProducts();
            this.products = productsLoaded;
            this.nextId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
        } catch (error) {
            console.error('Error al inicializar ProductManager:', error.message);
            // Considera si quieres manejar este error de otra manera
        }
    }
    
    async loadProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error('Error al cargar productos: ' + error.message);
        }
    }

    async saveProducts() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
        } catch (error) {
            throw new Error('Error al guardar productos: ' + error.message);
        }
    }

    async addProduct({ title, description, price, thumbnail, code, stock }) {
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
        await this.saveProducts();
        return product;
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    async updateProduct(id, updatedProduct) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            return null;
        }

        this.products[index] = { ...this.products[index], ...updatedProduct };
        await this.saveProducts();
        return this.products[index];
    }

    async deleteProduct(id) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            return false;
        }

        this.products.splice(index, 1);
        await this.saveProducts();
        return true;
    }
}

module.exports = ProductManager;
