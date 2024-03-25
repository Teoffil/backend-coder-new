require('dotenv').config();

module.exports = {
    mongoUri: process.env.MONGO_URI,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    port: process.env.PORT || 3000,
};