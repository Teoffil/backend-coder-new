// src/utils/templates/ticketEmailTemplate.js
module.exports = (ticket) => {
    return `
        <div>
            <h1>Confirmación de Pedido</h1>
            <p>Estimado cliente,</p>
            <p>Gracias por su compra. Aquí están los detalles de su pedido:</p>
            <p><strong>ID del Ticket:</strong> ${ticket._id}</p>
            <p><strong>Código:</strong> ${ticket.code}</p>
            <p><strong>Fecha de Compra:</strong> ${ticket.purchase_datetime}</p>
            <p><strong>Total:</strong> ${ticket.amount}</p>
            <p>Si tiene alguna pregunta, por favor contacte con soporte.</p>
            <p>Saludos,</p>
            <p>Su Compañía</p>
        </div>
    `;
};
