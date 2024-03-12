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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Asegúrate de que 'User' sea el nombre exacto del modelo de usuario
        required: true // Esto asegura que cada carrito esté asociado a un usuario
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
    }
}, { timestamps: true }); // Los timestamps son útiles para rastrear cuándo se creó o actualizó el carrito

module.exports = mongoose.model('Cart', CartSchema);

