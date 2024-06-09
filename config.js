require('dotenv').config();

module.exports = {
    mongoUri: process.env.MONGO_URI,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    port: process.env.PORT || 3000,
    emailConfig: {
        service: process.env.EMAIL_SERVICE,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS,
    }
};
