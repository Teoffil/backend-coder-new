const Ticket = require('../models/TicketSchema');

class TicketDAO {
    async createTicket(data) {
        const ticket = new Ticket(data);
        return await ticket.save();
    }

    async getTicketById(ticketId) {
        return await Ticket.findById(ticketId).populate('purchaser').populate('cartId'); // Asegúrate de hacer populate del carrito
    }
}

module.exports = TicketDAO;
