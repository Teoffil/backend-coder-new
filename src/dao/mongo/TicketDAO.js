const Ticket = require('../models/TicketSchema');

class TicketDAO {
    async createTicket(data) {
        const ticket = new Ticket(data);
        return await ticket.save();
    }

    async getTicketById(ticketId) {
        return await Ticket.findById(ticketId).populate('purchaser');
    }
}

module.exports = TicketDAO;