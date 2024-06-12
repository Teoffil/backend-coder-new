// src/controllers/ticketController.js
const TicketDAO = require('../dao/mongo/TicketDAO');
const ticketDAO = new TicketDAO();

const ticketController = {
    showTicket: async (req, res) => {
        try {
            const ticket = await ticketDAO.getTicketById(req.params.ticketId);
            if (!ticket) {
                return res.status(404).send('Ticket not found');
            }
            res.render('ticket', {
                ticketId: ticket._id,
                code: ticket.code,
                purchaseDatetime: ticket.purchase_datetime,
                amount: ticket.amount,
                purchaser: ticket.purchaser
            });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
};

module.exports = ticketController;
