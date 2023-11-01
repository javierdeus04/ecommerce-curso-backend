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

            socketClient.on('addProduct', async (newProduct) => {
                const { title, category, description, price, thumbnail, code, stock } = newProduct;
                const response = await productManager.addProduct(title, category, description, price, thumbnail, code, stock);
                socketClient.emit('addProductResponse', { product: response });
            });

            socketClient.on('deletedProduct', async ({productId}) => {
                console.log(productId)
                const response = await productManager.deleteProduct(productId);
                socketClient.emit('deletedProduct', { response });          
            });

            socketClient.on('updateProduct', async ({ productId, formValues }) => {             
                const response = await productManager.updateProduct(productId, formValues);
                socketClient.emit('updateProductResponse', { response });
            });

            socketClient.on('searchProduct', async (productSearchId) => {
                const response = await productManager.getProductsById(productSearchId);
                socketClient.emit('result', { response });
            })

            socketServer.emit('productsList', { productsList });
        });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }
}