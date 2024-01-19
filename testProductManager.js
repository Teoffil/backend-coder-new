const ProductManager = require('./productManager');

async function testProductManager() {
    // Crear una instancia de ProductManager
    const manager = new ProductManager('./products.json');

    // Test 1: getProducts debería devolver un arreglo vacío al inicio
    console.log('Test 1: getProducts en una instancia recién creada');
    console.log(manager.getProducts());  // Debería mostrar []

    // Test 2: Agregar un producto y verificar si se agrega correctamente
    console.log('\nTest 2: Agregar un producto');
    const newProduct = {
        title: "producto prueba",
        description: "Este es un producto prueba",
        price: 200,
        thumbnail: "Sin imagen",
        code: "abc123",
        stock: 25
    };
    const addedProduct = manager.addProduct(newProduct);
    console.log('Producto agregado:', addedProduct);

    // Test 3: Verificar si el producto agregado aparece en getProducts
    console.log('\nTest 3: Verificar getProducts después de agregar un producto');
    console.log(manager.getProducts());

    // Test 4: Obtener un producto por su ID
    console.log('\nTest 4: getProductById');
    console.log(manager.getProductById(addedProduct.id));

    // Test 5: Actualizar un producto
    console.log('\nTest 5: updateProduct');
    manager.updateProduct(addedProduct.id, { title: "producto actualizado" });
    console.log(manager.getProductById(addedProduct.id));

    // Test 6: Eliminar un producto
    console.log('\nTest 6: deleteProduct');
    manager.deleteProduct(addedProduct.id);
    console.log(manager.getProducts());

    // Test 7: Intentar agregar un producto con título vacío
    console.log('\nTest 7: Agregar un producto con título vacío');
    try {
        manager.addProduct({ title: "", description: "desc", price: 100, thumbnail: "url", code: "123", stock: 10 });
    } catch (error) {
        console.log('Error esperado:', error.message);
    }

    // Test 8: Intentar agregar un producto con stock no válido
    console.log('\nTest 8: Agregar un producto con stock no válido');
    try {
        manager.addProduct({ title: "Producto", description: "desc", price: 100, thumbnail: "url", code: "123", stock: -5 });
    } catch (error) {
        console.log('Error esperado:', error.message);
    }
}

testProductManager().catch(console.error);

