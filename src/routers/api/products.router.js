import { Router } from 'express';
import ProductsController from '../../controllers/products.controller.js';
import { isAdmin } from '../../../utils/utils.js';
import { errorHandlerMiddleware } from '../../middlewares/error-handler-middleware.js';
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

router.post('/products', isAdmin, async (req, res) => {
    try {
        const { body } = req;
        const product = await ProductsController.create(body)
        logger.debug('Productsontroller.create() finished successfully')
        logger.info(`Successfully created product: ${product._id}`)
        res.status(201).json(product);
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: GET. Path: /products')
        res.status(404).json({ message: 'Pagina no encontrada', error })
    }
});

router.put('/products/:pid', isAdmin, async (req, res) => {
    const { pid } = req.params;
    const { body } = req;
    try {
        await ProductsController.updateById(pid, body);
        logger.info(`Product successfully updated: ${pid}`)
        res.status(204).end();
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: GET. Path: /products')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.delete('/products/:pid', isAdmin, async (req, res) => {
    const { pid } = req.params;
    try {
        await ProductsController.deleteById(pid);
        logger.debug('ProductsController.deleteById() finished successfully')
        logger.info(`Product successfully removed: ${pid}`)
        res.status(204).end();
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: GET. Path: /products')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

export default router;