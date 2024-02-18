// src/dao/models/ProductSchema.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    thumbnail: String,
    code: String,
    stock: Number
});

module.exports = mongoose.model('Product', ProductSchema);
