const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Asegúrate de que 'Product' sea el nombre exacto del modelo de productos
            required: true // Esto asegura que cada producto en el carrito debe tener un productId válido
        },
        quantity: {
            type: Number,
            required: true, // Esto asegura que cada producto en el carrito debe tener una cantidad especificada
            min: 1 // Esto asegura que la cantidad mínima de cada producto es al menos 1
        }
    }],
    // Si necesitas rastrear más información en el carrito, como el usuario que lo posee, puedes agregarlo aquí
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Solo si decides asociar cada carrito a un usuario específico
        required: false // Depende de tu lógica de negocio
    }
}, { timestamps: true }); // Los timestamps son útiles para rastrear cuándo se creó o actualizó el carrito

module.exports = mongoose.model('Cart', CartSchema);
