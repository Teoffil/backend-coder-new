const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Reemplaza con tu cadena de conexión a MongoDB
const mongoURI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    age: Number,
    role: String
});

const User = mongoose.model('User', userSchema);

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('adminCod3r123', 10); // Reemplaza 'yourAdminPassword' con una contraseña segura
        const admin = new User({
        first_name: 'Admin',
        last_name: 'User',
        email: 'adminCoder@coder.com', // Asegúrate de que este email no esté ya en uso en tu base de datos
        password: hashedPassword,
        age: 30,
        role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.disconnect();
    }
}

createAdmin();
