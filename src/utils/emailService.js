// src/utils/emailService.js
const nodemailer = require('nodemailer');
const inactivityEmailTemplate = require('./templates/inactivityEmailTemplate');
const productDeletedTemplate = require('./templates/productDeletedTemplate');
const ticketEmailTemplate = require('./templates/ticketEmailTemplate');
const config = require('../../config');  // Importar configuraciones desde config.js

const transporter = nodemailer.createTransport({
    service: config.emailConfig.service,
    auth: {
        user: config.emailConfig.user,
        pass: config.emailConfig.pass
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendResetEmail = async (to, token) => {
    const resetLink = `http://localhost:8080/reset-password/${token}`;
    const mailOptions = {
        from: `"Password Reset" <${config.emailConfig.user}>`,
        to: to,
        subject: 'Solicitud de restablecimiento de contraseña',
        html: `<p>Haga clic <a href="${resetLink}">aquí</a> para restablecer su contraseña. Si no solicitó esto, por favor ignore este correo electrónico.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de restablecimiento de contraseña enviado con éxito');
    } catch (error) {
        console.error('Error enviando el correo de restablecimiento de contraseña:', error);
    }
};

const sendTestEmail = async (to) => {
    const mailOptions = {
        from: `"Correo de Prueba" <${config.emailConfig.user}>`,
        to: to,
        subject: 'Correo de Prueba',
        html: '<div><h1>¡Este es un correo de prueba!</h1></div>'
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de prueba enviado con éxito');
    } catch (error) {
        console.error('Error enviando el correo de prueba:', error);
    }
};

const sendInactivityEmail = async (email) => {
    const mailOptions = {
        from: `"Alerta de Inactividad" <${config.emailConfig.user}>`,
        to: email,
        subject: 'Eliminación de cuenta por inactividad',
        html: inactivityEmailTemplate(email)  // Asegúrate de que esto devuelva una cadena
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo de inactividad enviado a ${email}`);
    } catch (error) {
        console.error('Error enviando el correo de inactividad:', error);
    }
};

const sendProductDeletedEmail = async (email) => {
    const mailOptions = {
        from: `"Producto Eliminado" <${config.emailConfig.user}>`,
        to: email,
        subject: 'Notificación de eliminación de producto',
        html: productDeletedTemplate(email)  // Asegúrate de que esto devuelva una cadena
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo de eliminación de producto enviado a ${email}`);
    } catch (error) {
        console.error('Error enviando el correo de eliminación de producto:', error);
    }
};

const sendTicketEmail = async (to, ticket, cart) => {
    const mailOptions = {
        from: `"Confirmación de Pedido" <${config.emailConfig.user}>`,
        to: to,
        subject: 'Confirmación de su Pedido',
        html: ticketEmailTemplate(ticket, cart)  // Usar la plantilla de ticket y pasar el carrito
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo de ticket enviado a ${to}`);
    } catch (error) {
        console.error('Error enviando el correo de ticket:', error);
    }
};

module.exports = {
    sendResetEmail,
    sendTestEmail,
    sendInactivityEmail,
    sendProductDeletedEmail,
    sendTicketEmail  // Exportar la nueva función
};
