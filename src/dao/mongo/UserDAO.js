// src/dao/mongo/UserDAO.js
const User = require('../models/UserSchema');
const bcrypt = require('bcryptjs');

class UserDAO {
    constructor() { }

    // Método para crear un nuevo usuario
    async createUser(userData) {
        const user = new User(userData);
        await user.save();
        return user;
    }

    // Método para obtener un usuario por ID
    async getUserById(userId) {
        return await User.findById(userId);
    }

    // Método para obtener un usuario por correo electrónico
    async getUserByEmail(email) {
        return await User.findOne({ email });
    }

    // Método para actualizar un usuario
    async updateUser(userId, userData) {
        // Actualiza la contraseña si se modifica durante la actualización
        if (userData.password) {
            userData.password = bcrypt.hashSync(userData.password, 10);
        }
        return await User.findByIdAndUpdate(userId, userData, { new: true });
    }

    // Método para eliminar un usuario
    async deleteUser(userId) {
        await User.findByIdAndDelete(userId);
        return { message: 'Usuario eliminado correctamente' };
    }

    // Método para verificar las credenciales de un usuario
    async verifyCredentials(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            return null; // o manejar como error según tu lógica de negocio
        }
        const isMatch = user.comparePassword(password);
        if (!isMatch) {
            return null; // o manejar como error según tu lógica de negocio
        }
        return user;
    }

    // Método para actualizar el rol del usuario
    async updateUserRole(userId, role) {
        const user = await User.findById(userId);
        if (!user) {
            return null;
        }

        user.role = role;
        await user.save();
        return user;
    }
}

module.exports = UserDAO;
