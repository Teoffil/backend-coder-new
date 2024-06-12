// src/utils/templates/ticketEmailTemplate.js
module.exports = (ticket, cart) => {
    const productDetails = cart.products.map(item => {
        return `<li>${item.productId.title} - Cantidad: ${item.quantity} - Precio: AR$ ${item.productId.price.toFixed(2)}</li>`;
    }).join('');

    return `
        <div>
            <h1>Confirmación de Pedido BigTecnology</h1>
            <p>Estimado cliente,</p>
            <p>Gracias por su compra. Aquí están los detalles de su pedido:</p>
            <p><strong>Código de Ticket:</strong> ${ticket._id}</p>
            <p><strong>Fecha de Compra:</strong> ${ticket.purchase_datetime}</p>
            <p><strong>Total a Pagar:</strong> AR$ ${ticket.amount.toFixed(2)}</p>
            <p><strong>Productos:</strong></p>
            <ul>
                ${productDetails}
            </ul>
            <p><strong>→ Para realizar la compra ingrese en este link: www.linkficticiodecompra.com</strong></p>
            <p>Saludos,</p>
            <p>BigTecnology a su servicio</p>
        </div>
    `;
};
