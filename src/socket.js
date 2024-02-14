import { Server } from 'socket.io';

import MessageSchema from './dao/models/message.model.js';
import { logger } from './config/logger.js';

export const initSocket = async (httpServer) => {
    const socketServer = new Server(httpServer);

    try {

        socketServer.on('connection', (socketClient) => {
            logger.info(`Nuevo cliente conectado: ${socketClient.id}`);

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
        logger.error('Error al obtener los mensajes:', error);
    }
}