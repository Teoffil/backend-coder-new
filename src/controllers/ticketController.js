// src/controllers/ticketController.js
const TicketDAO = require('../dao/mongo/TicketDAO');
const CartDAO = require('../dao/mongo/CartDAO');
const ticketDAO = new TicketDAO();
const cartDAO = new CartDAO();

const ticketController = {
    showTicket: async (req, res) => {
        try {
            const ticket = await ticketDAO.getTicketById(req.params.ticketId);
            if (!ticket) {
                return res.status(404).send('Ticket not found');
            }

            const cart = await cartDAO.getCartById(ticket.cartId); // Obtener el carrito asociado al ticket

            res.render('ticket', {
                ticketId: ticket._id,
                code: ticket.code,
                purchaseDatetime: ticket.purchase_datetime,
                amount: ticket.amount,
                purchaser: ticket.purchaser,
                products: cart.products // Pasar los productos a la vista
            });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
};

module.exports = ticketController;

