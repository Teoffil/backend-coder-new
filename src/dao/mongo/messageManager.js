// src/dao/mongo/MessageManager.js
const Message = require('../models/MessageSchema');

class MessageManager {
    constructor() {}

    // Guardar un nuevo mensaje
    async saveMessage(userData) {
        const message = new Message(userData);
        await message.save();
        return message;
    }

    // Obtener todos los mensajes
    async getAllMessages() {
        const messages = await Message.find();
        return messages;
    }
}

module.exports = new MessageManager();
