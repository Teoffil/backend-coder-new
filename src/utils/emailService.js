const nodemailer = require('nodemailer');
const inactivityEmailTemplate = require('./templates/inactivityEmailTemplate');
const productDeletedTemplate = require('./templates/productDeletedTemplate');
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
        subject: 'Password Reset Request',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password. If you did not request this, please ignore this email.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully');
    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
};

const sendTestEmail = async (to) => {
    const mailOptions = {
        from: `"Test Email" <${config.emailConfig.user}>`,
        to: to,
        subject: 'Test Email',
        html: '<div><h1>This is a test email!</h1></div>'
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Test email sent successfully');
    } catch (error) {
        console.error('Error sending test email:', error);
    }
};

const sendInactivityEmail = async (email) => {
    const mailOptions = {
        from: `"Inactivity Alert" <${config.emailConfig.user}>`,
        to: email,
        subject: 'Account Deletion Due to Inactivity',
        html: inactivityEmailTemplate(email)  // Asegúrate de que esto devuelva una cadena
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Inactivity email sent to ${email}`);
    } catch (error) {
        console.error('Error sending inactivity email:', error);
    }
};

const sendProductDeletedEmail = async (email) => {
    const mailOptions = {
        from: `"Product Deleted" <${config.emailConfig.user}>`,
        to: email,
        subject: 'Product Deletion Notification',
        html: productDeletedTemplate(email)  // Asegúrate de que esto devuelva una cadena
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Product deletion email sent to ${email}`);
    } catch (error) {
        console.error('Error sending product deletion email:', error);
    }
};

module.exports = {
    sendResetEmail,
    sendTestEmail,
    sendInactivityEmail,
    sendProductDeletedEmail
};
