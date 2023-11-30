import express from 'express';
import handlebars from 'express-handlebars';
import path from 'path';

import { __dirname } from './utils.js';
import indexRouter from './routers/views/index.router.js'
import productsRouter from './routers/api/products.router.js'
import cartsRouter from './routers/api/carts.router.js'

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')))

app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

////////

app.use('/', indexRouter, productsRouter, cartsRouter);
app.use('/api', productsRouter, cartsRouter);

app.get('/', (req, res) => {
    res.send('Hola 18/11');
});

////////

app.use((error, req, res, next) => {
    const message = `Ha ocurrido un error desconocido: ${error.message}`;
    console.log(message);
    res.status(500).json({ message }) 
})

export default app;
