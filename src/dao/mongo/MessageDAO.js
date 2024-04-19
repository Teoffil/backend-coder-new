const Message = require('../models/MessageSchema');

class MessageDAO {
    constructor() {}

    // Método para guardar un nuevo mensaje
    async saveMessage(userData) {
        const message = new Message(userData);
        await message.save();
        return message;
    }

    // Método para obtener todos los mensajes
    async getAllMessages() {
        return await Message.find();
    }

    // Método para encontrar un mensaje por ID (si se necesita)
    async getMessageById(id) {
        return await Message.findById(id);
    }

    // Método para actualizar un mensaje por ID (si se necesita)
    async updateMessage(id, updateData) {
        return await Message.findByIdAndUpdate(id, updateData, { new: true });
    }

    // Método para eliminar un mensaje por ID (si se necesita)
    async deleteMessage(id) {
        return await Message.findByIdAndDelete(id);
    }
}

module.exports = MessageDAO;

