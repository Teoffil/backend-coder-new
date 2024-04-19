const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ProductSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,  // Asegurándose que el _id es del tipo ObjectId
    title: String,
    description: String,
    price: Number,
    thumbnail: String,
    code: String,
    stock: Number,
});

ProductSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;

