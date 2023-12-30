const ProductManager = require('./productManager.js');

async function testProductManager() {
    const manager = new ProductManager();

    // Test 1: getProducts debe devolver un arreglo vacío
    console.log('Test 1: getProducts en instancia recién creada debe ser un arreglo vacío');
    console.log(manager.getProducts()); // Debe mostrar []

    // Test 2: Agregar un producto y verificar si se agrega correctamente
    console.log('\nTest 2: Agregar un producto y verificar si se agrega correctamente');
    manager.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen", "abc123", 25);
    console.log(manager.getProducts()); // Debe mostrar el producto agregado

    // Test 3: Intentar agregar un producto con código repetido y capturar el error
    console.log('\nTest 3: Intentar agregar un producto con código repetido');
    try {
        manager.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen", "abc123", 25);
    } catch (error) {
        console.error(error.message); // Debe mostrar error de código repetido
    }

    // Test 4: Probar getProductById con un id existente y uno inexistente
    console.log('\nTest 4: Probar getProductById');
    console.log('Producto con ID 1:', manager.getProductById(1)); // Debe mostrar el producto
    console.log('Producto con ID 2:', manager.getProductById(2)); // Debe mostrar "Not found"
}

testProductManager();