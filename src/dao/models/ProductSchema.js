// src/dao/models/ProductSchema.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ProductSchema = new mongoose.Schema({
  // tus definiciones de esquema aquí
    title: String,
    description: String,
    price: Number,
    thumbnail: String,
    code: String,
    stock: Number,
});

ProductSchema.plugin(mongoosePaginate); // Correctamente aplicado al esquema

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
