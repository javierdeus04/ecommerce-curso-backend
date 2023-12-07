import { Router } from 'express';

import ProductsManager from '../../dao/Products.manager.js';
import ProductModel from '../../dao/models/product.model.js'
import { buildResponsePaginated } from '../../utils.js'


const router = Router();

router.get('/products', async (req, res) => {
    const { limit = 10, page = 1, sort, category, stock } = req.query;
    const criteria = {};
    const options = { limit, page };
    if (sort) {
        options.sort = { price: sort };
    }
    if (category) {
        criteria.category = category;
    }

    if (stock !== undefined) {
        criteria.stock = stock === 'true' ? { $ne: 0 } : undefined;
    }
    try {
        const products = await ProductModel.paginate(criteria, options);
        
        if (page > products.totalPages) {
            throw new Error(`La página solicitada: ${page} no existe.`);
        }
        res.status(200).json(buildResponsePaginated({...products, sort, category, stock}));
    } catch (error) {
        console.error(error.message);
        res.status(400).send({ error: error.message });
    }
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