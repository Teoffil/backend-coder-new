class MessageDTO {
    constructor(message) {
        this.id = message._id;
        this.content = message.content;
        this.senderId = message.senderId;
        this.timestamp = message.createdAt;  // Asumiendo que tienes un campo createdAt en tu esquema
    }
}

module.exports = MessageDTO;
