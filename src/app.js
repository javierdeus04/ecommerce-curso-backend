import express from 'express';
import handlebars from 'express-handlebars';
import path from 'path';

import { __dirname } from './utils.js';
import indexRouter from './routers/views/index.router.js'
import { ProductManager } from './products.app.js';
import productApiRouter from './routers/api/products.router.js'


const app = express();
const productManager = new ProductManager();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')))

app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use('/', indexRouter);
app.use('/api', productApiRouter);

/* app.get('/products', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.status(200).render('home', { products });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
}); */

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts')
})

app.get('/', (req, res) => {
    res.send('Hola 18/11');
});

app.use((error, req, res, next) => {
    const message = `Ha ocurrido un error desconocido: ${error.message}`;
    console.log(message);
    res.status(500).json({ message }) 
})

//const productsRouter = require('./routers/products.router');
//const cartsRouter = require('./routers/carts.router');

//app.use('/api', productsRouter, cartsRouter);

export default app;
