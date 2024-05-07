// src/dao/models/ProductSchema.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ProductSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    thumbnail: String,
    code: String,
    stock: Number,
    owner: { type: String, default: null }
});

ProductSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
