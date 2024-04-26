const MessageDAO = require('../dao/mongo/MessageDAO');
const MessageDTO = require('../dto/MessageDTO');
const {
    INTERNAL_SERVER_ERROR,
    MESSAGE_NOT_FOUND, 
    INVALID_REQUEST
} = require('../utils/errorMessages');

const messageDAO = new MessageDAO();

const messageController = {
    getAllMessages: async (req, res) => {
        console.log("Accediendo a getAllMessages");
        try {
            const messages = await messageDAO.getAllMessages();
            if (!messages) {
                throw new Error(MESSAGE_NOT_FOUND.message);
            }
            const messageDTOs = messages.map(msg => new MessageDTO(msg));
            res.json(messageDTOs);
        } catch (error) {
            const statusCode = error.statusCode || 500;
            const errorMessage = error.message || INTERNAL_SERVER_ERROR.message;
            res.status(statusCode).send("Error al obtener mensajes: " + errorMessage);
        }
    },

    postMessage: async (req, res) => {
        try {
            if (!req.body.user || !req.body.message) {
                throw new Error(INVALID_REQUEST.message);
            }
            const newMessage = await messageDAO.saveMessage({
                user: req.body.user,
                message: req.body.message,
                timestamp: new Date() // or let Mongoose handle it by default
            });
            if (!newMessage) {
                throw new Error(INTERNAL_SERVER_ERROR.message);
            }
            const messageDto = new MessageDTO(newMessage);
            res.status(201).json(messageDto);
        } catch (error) {
            const statusCode = error.statusCode || 500;
            const errorMessage = error.message || INTERNAL_SERVER_ERROR.message;
            res.status(statusCode).send("Error al enviar mensaje: " + errorMessage);
        }
    }
};

module.exports = messageController;
