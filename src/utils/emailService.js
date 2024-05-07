const nodemailer = require('nodemailer');
const { emailConfig } = require('../../config');

const transporter = nodemailer.createTransport({
    service: emailConfig.service,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    },
    tls: {
        rejectUnauthorized: false // Permitir certificados autofirmados
    }
});

const sendResetEmail = async (to, token) => {
    const resetLink = `http://localhost:8080/reset-password/${token}`;
    const mailOptions = {
        from: `"Password Reset" <${emailConfig.user}>`,
        to: to,
        subject: 'Password Reset Request',
        html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to set a new password. If you did not request this, please ignore this email.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Reset password email sent successfully');
    } catch (error) {
        console.error('Error sending reset password email:', error);
    }
};

const sendTestEmail = async (to) => {
    const mailOptions = {
        from: `"Coder Tests" <${emailConfig.user}>`,
        to: to,
        subject: 'Correo de prueba',
        html: '<div><h1>¡Esto es un test!</h1></div>'
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Test email sent successfully');
    } catch (error) {
        console.error('Error sending test email:', error);
    }
};

module.exports = { sendResetEmail, sendTestEmail };
