import { Server } from 'socket.io';
import { ProductManager } from './products.app.js';

const productManager = new ProductManager();

export const init = async (httpServer) => {
    const socketServer = new Server(httpServer);

    try {
        let productsList = await productManager.getProducts();
        
        socketServer.on('connection', (socketClient) => {
            console.log(`Nuevo cliente conectado: ${socketClient.id}`);
    
            socketClient.emit('productsList', { productsList });
    
            socketClient.on('newProduct', (newProduct) => {
                productsList.push(newProduct);
                socketClient.emit('productsList', { productsList });
                console.log(newProduct);
            });
        });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }
}