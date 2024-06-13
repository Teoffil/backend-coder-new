const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        default: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cartId: { // Añadir cartId al esquema del ticket
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    }
});

const Ticket = mongoose.model('Ticket', TicketSchema);
module.exports = Ticket;
