import { Router } from 'express';

import ProductsManager from '../../dao/Products.manager.js';

const router = Router();

/* router.get('/', (req, res) => {
    res.render('home', {title: 'E-Commerce'});
}); */

router.get('/products', async (req, res) => {
    const products = await ProductsManager.get();
    res.render('products', { products: products.map(product => product.toJSON()), title: 'Lista de productos'});
});

router.get('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    const product = await ProductsManager.getById(pid);
    res.render('productDetail', {product: product.toJSON()});
});

router.get('/', (req, res) => {
    res.render('chat', {title: 'Chat'});
});

export default router;