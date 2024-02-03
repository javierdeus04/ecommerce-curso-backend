import { Router } from 'express';
import ProductsController from '../../controllers/products.controller.js';
import { isAdmin } from '../../../utils/utils.js';
import { errorHandlerMiddleware } from '../../middlewares/error-handler-middleware.js';

const router = Router();

router.get('/products', async (req, res) => {
    try {
        const products = await ProductsController.getAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.get('/products/:pid', async (req, res, next) => {
    const { pid } = req.params;
    try {
        const product = await ProductsController.getById(pid);
        res.status(200).json(product);
    } catch (error) {
        next(error)
    }
});

router.post('/products', isAdmin, async (req, res, next) => {
    try {
        const { body } = req;
        const product = await ProductsController.create(body)
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
});

router.put('/products/:pid', isAdmin, async (req, res) => {
    const { pid } = req.params;
    const { body } = req;
    try {
        await ProductsController.updateById(pid, body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: 'Error al intentar actualizar el producto' })
    }
});

router.delete('/products/:pid', isAdmin, async (req, res) => {
    const { pid } = req.params;
    try {
        await ProductsController.deleteById(pid);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: 'Error al intentar eliminar el producto' })
    }
});

export default router;