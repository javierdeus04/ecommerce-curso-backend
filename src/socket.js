import { Server } from 'socket.io';

import MessageSchema from './dao/models/message.model.js';

export const initSocket = async (httpServer) => {
    const socketServer = new Server(httpServer);

    try {

        socketServer.on('connection', (socketClient) => {
            console.log(`Nuevo cliente conectado: ${socketClient.id}`);

            MessageSchema.find().then((messages) => {
                socketClient.emit('messages', messages)
            });

            socketClient.on('new-message', (newMessage) => {
                const message = new MessageSchema(newMessage);
                message.save().then(() => {
                    socketServer.emit('new-message', newMessage);
                    MessageSchema.find().then((messages) => {
                        socketServer.emit('messages', messages)
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }
}