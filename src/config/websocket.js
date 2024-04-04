const socketIo = require('socket.io');
const Message = require('../dao/models/MessageSchema');

const initializeWebSockets = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('Un usuario se ha conectado al chat.');

        Message.find().then(messages => {
        socket.emit('updateMessages', messages);
        });

        socket.on('newMessage', (msg) => {
        const message = new Message(msg);
        message.save().then(() => {
            Message.find().then(messages => {
            io.emit('updateMessages', messages);
            });
        });
        });
    });
};

module.exports = initializeWebSockets;
