const Ticket = require('../models/TicketSchema');

class TicketDAO {
    async createTicket(data) {
        const ticket = new Ticket(data);
        return await ticket.save();
    }
}

module.exports = TicketDAO;