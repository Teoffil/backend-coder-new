const mongoose = require('mongoose');
const { mongoUri } = require('./config');

const connectDB = async () => {
    try {
        // Conexión simplificada sin opciones obsoletas
        const conn = await mongoose.connect(mongoUri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

