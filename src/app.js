const express = require('express');
const path = require('path')

const productsRouter = require('./routers/products.router');
const cartsRouter = require('./routers/carts.router');

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

app.use('/api', productsRouter, cartsRouter);

app.listen(PORT, () => {
    console.log(`Server running in http://localhost:${PORT}`);
})
