const MessageDAO = require('../dao/mongo/MessageDAO');
const MessageDTO = require('../dto/MessageDTO');

const messageDAO = new MessageDAO();

const messageController = {
    getAllMessages: async (req, res) => {
        try {
            const messages = await messageDAO.getAllMessages();
            const messageDTOs = messages.map(msg => new MessageDTO(msg));
            res.json(messageDTOs);
        } catch (error) {
            res.status(500).send("Error al obtener mensajes: " + error.message);
        }
    },

    postMessage: async (req, res) => {
        try {
            const newMessage = await messageDAO.saveMessage({
                user: req.body.user,
                message: req.body.message,
                timestamp: new Date() // or let Mongoose handle it by default
            });
            const messageDto = new MessageDTO(newMessage);
            res.status(201).json(messageDto);
        } catch (error) {
            res.status(500).send("Error al enviar mensaje: " + error.message);
        }
    }
};

module.exports = messageController;
