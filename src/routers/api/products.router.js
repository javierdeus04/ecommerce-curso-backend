import { Router } from 'express';
import passport from 'passport';

import ProductsController from '../../controllers/products.controller.js';
import { isAdmin, isAdminOrPremium, isPremium } from '../../../utils/utils.js';
import { logger } from '../../config/logger.js';

const router = Router();

router.get('/products', async (req, res) => {
    try {
        const products = await ProductsController.getAll();
        logger.debug('ProductsController.getAll() finished successfully')
        logger.info('Products loaded successfully')
        res.status(200).json(products);
    } catch (error) {
        logger.error('API Router Error. Method: GET. Path: /products')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.get('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await ProductsController.getById(pid);
        logger.debug('ProductsController.getById() finished successfully')
        logger.info(`Viewing product: ${product._id}`)
        res.status(200).json(product);
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: GET. Path: /products/:pid')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.post('/products', passport.authenticate('jwt', { session: false }), isAdminOrPremium, async (req, res) => {
    try {
        const { body, user } = req;
        const ownerId = user.role === 'admin' ? 'admin' : user._id;
        const product = await ProductsController.create(body, ownerId);
        logger.debug('ProductsController.create() finished successfully');
        logger.info(`Successfully created product: ${product._id}`);
        res.status(201).json(product);
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: POST. Path: /products');
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/products/:pid', isAdmin, async (req, res) => {
    const { pid } = req.params;
    const { body } = req;
    try {
        await ProductsController.updateById(pid, body);
        logger.info(`Product successfully updated: ${pid}`)
        const productUpdated = await ProductsController.getById(pid)
        logger.debug('ProductsController.getById() finished successfully')
        res.status(204).json(productUpdated);
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: PUT. Path: /products')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.put('/premium/products/:pid', passport.authenticate('jwt', { session: false }), isPremium, async (req, res) => {
    const { pid } = req.params;
    const { body } = req;
    const uid = req.user._id;
    try {
        await ProductsController.updateOwnProductById(uid, pid, body);
        logger.debug('ProductsController.updateOwnProductById() finished successfully')
        logger.info(`Product successfully updated: ${pid}`)
        const productUpdated = await ProductsController.getById(pid)
        logger.debug('ProductsController.getById() finished successfully')
        res.status(204).json(productUpdated);
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: PUT. Path: premium/products/:pid')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.delete('/products/:pid', isAdmin, async (req, res) => {
    const { pid } = req.params;
    try {
        await ProductsController.deleteById(pid);
        logger.debug('ProductsController.deleteById() finished successfully')
        logger.info(`Product successfully removed: ${pid}`)
        res.status(204).json({ message: 'Product deleted' });
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: DELETE. Path: /products/:pid')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.delete('/premium/products/:pid', passport.authenticate('jwt', { session: false }), isPremium, async (req, res) => {
    const { pid } = req.params;
    const uid = req.user._id;
    try {
        await ProductsController.deleteOwnProductById(uid, pid);
        logger.debug('ProductsController.deleteOwnProductById() finished successfully')
        logger.info(`Product successfully removed: ${pid}`)
        res.status(204).json({ message: 'Product deleted' });
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: DELETE. Path: premium/products/:pid')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

export default router;