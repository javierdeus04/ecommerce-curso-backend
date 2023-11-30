import { Router } from 'express';

import { buildResponsePaginated } from '../../utils.js'
import ProductModel from '../../dao/models/product.model.js'
import ProductsManager from '../../dao/Products.manager.js';
import CartsManager from '../../dao/Carts.manager.js';

const router = Router();

router.get('/products', async (req, res) => {
    const { limit = 10, page = 1, sort, search } = req.query;
    const criteria = {};
    const options = { limit, page };
    if (sort) {
        options.sort = { price: sort };
    }
    if (search) {
        criteria.category = search;
    }
    const products = await ProductModel.paginate(criteria, options);
    const baseUrl = 'http://localhost:8080';
    const data = buildResponsePaginated({...products, sort, search}, baseUrl);
    res.render('products', {title: 'Productos', sort, baseUrl, ...data});
});

router.get('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    const product = await ProductsManager.getById(pid);
    const productObject = product.toObject();
    res.render('productDetail', {title: 'Productos', productObject});
});

router.get('/chat', (req, res) => {
    res.render('chat', {title: 'Chat'});
});

router.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await CartsManager.getById(cid);
        const cartObject = cart.toObject();

        res.render('carts', { title: 'Carrito', cartObject });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: error.message });
    }
})


export default router;