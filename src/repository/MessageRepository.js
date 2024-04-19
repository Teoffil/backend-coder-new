const MessageDAO = require('../dao/mongo/MessageDAO');
const MessageDTO = require('../dto/MessageDTO');

class MessageRepository {
    constructor() {
        this.messageDao = new MessageDAO();
    }

    async saveMessage(userData) {
        const message = await this.messageDao.saveMessage(userData);
        return new MessageDTO(message);
    }

    async getAllMessages() {
        const messages = await this.messageDao.getAllMessages();
        return messages.map(msg => new MessageDTO(msg));
    }

    async getMessageById(id) {
        const message = await this.messageDao.getMessageById(id);
        return new MessageDTO(message);
    }

    async updateMessage(id, updateData) {
        const message = await this.messageDao.updateMessage(id, updateData);
        return new MessageDTO(message);
    }

    async deleteMessage(id) {
        const message = await this.messageDao.deleteMessage(id);
        return message ? new MessageDTO(message) : null; // Asumiendo que quieres retornar algo tras borrar
    }
}

module.exports = MessageRepository;
