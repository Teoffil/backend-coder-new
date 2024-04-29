const MessageDAO = require('../dao/mongo/MessageDAO');
const MessageDTO = require('../dto/MessageDTO');
const logger = require('../config/logger'); 
const {
    INTERNAL_SERVER_ERROR,
    MESSAGE_NOT_FOUND, 
    INVALID_REQUEST
} = require('../utils/errorMessages');

const messageDAO = new MessageDAO();

const messageController = {
    getAllMessages: async (req, res) => {
        logger.debug("Accediendo a getAllMessages");
        try {
            const messages = await messageDAO.getAllMessages();
            if (!messages || messages.length === 0) {
                throw new Error(MESSAGE_NOT_FOUND.message);
            }
            const messageDTOs = messages.map(msg => new MessageDTO(msg));
            res.json(messageDTOs);
            logger.info('Messages retrieved successfully');
        } catch (error) {
            logger.error('Failed to retrieve messages', { error: error.message });
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
            logger.info('Message posted successfully', { userId: req.body.user });
        } catch (error) {
            logger.error('Failed to post message', { user: req.body.user, error: error.message });
            const statusCode = error.statusCode || 500;
            const errorMessage = error.message || INTERNAL_SERVER_ERROR.message;
            res.status(statusCode).send("Error al enviar mensaje: " + errorMessage);
        }
    }
};

module.exports = messageController;
