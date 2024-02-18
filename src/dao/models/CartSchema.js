// src/dao/models/CartSchema.js
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number
    }]
});

module.exports = mongoose.model('Cart', CartSchema);
