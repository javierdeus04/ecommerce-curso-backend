import { Router } from 'express';

import ProductsManager from '../../dao/Products.manager.js';
import ProductModel from '../../dao/models/product.model.js'
import { buildResponsePaginated } from '../../utils.js'


const router = Router();

router.get('/products', async (req, res) => {
    const { limit = 10, page = 1, sort, category, status } = req.query;
    const criteria = {};
    const options = { limit, page };
    if (sort) {
        options.sort = { price: sort };
    }
    if (category) {
        criteria.category = category;
    }

    if (status) {
        criteria.status = status
    }
    const products = await ProductModel.paginate(criteria, options);
    res.status(200).json(buildResponsePaginated({...products, sort, category, status}));
});

router.get('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    const product = await ProductsManager.getById(pid);
    res.status(200).json(product);
});

router.post('/products', async (req, res) => {
    const { body } = req;
    const product = await ProductsManager.create(body);
    res.status(201).json(product);
});

router.put('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    const { body } = req;
    await ProductsManager.updateById(pid, body);
    res.status(204).end();
});

router.delete('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    await ProductsManager.deleteById(pid);
    res.status(204).end();
});

export default router;