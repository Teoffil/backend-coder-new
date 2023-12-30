class ProductManager {
    constructor() {
        this.products = [];
        this.nextId = 1; // Para el id autoincrementable
    }

    // Método para añadir un producto
    addProduct(title, description, price, thumbnail, code, stock) {
        // Verificación de que todos los campos son proporcionados
        if (!title || !description || !price || !thumbnail || !code || !stock) {
            throw new Error("Todos los campos son obligatorios");
        }

        // Verificación de que el código del producto no se repita
        if (this.products.some(product => product.code === code)) {
            throw new Error("El código del producto ya existe");
        }

        const newProduct = {
            id: this.nextId++,
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        };

        this.products.push(newProduct);
    }

    // Método para obtener todos los productos
    getProducts() {
        return this.products;
    }

    // Método para obtener un producto por su ID
    getProductById(id) {
        const product = this.products.find(product => product.id === id);
        if (!product) {
            console.error("Not found");
            return null;
        }
        return product;
    }
}

// Ejemplo de uso:
const manager = new ProductManager();
manager.addProduct("Producto 1", "Descripción del producto 1", 100, "/img/prod1.jpg", "code123", 10);
console.log(manager.getProducts()); // Muestra los productos
console.log(manager.getProductById(1)); // Muestra el producto con id 1

module.exports = ProductManager;
