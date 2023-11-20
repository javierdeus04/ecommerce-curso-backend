import { Router } from 'express';

import ProductsManager from '../../dao/Products.manager.js';

const router = Router();

router.get('/products', async (req, res) => {
    const products = await ProductsManager.get();
    res.status(200).json(products);
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