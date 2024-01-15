import { Router } from 'express';
import ProductsController from '../../controllers/products.controller.js';
const router = Router();

router.get('/products', async (req, res) => {
    try {
        const products = await ProductsController.getAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.get('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await ProductsController.getById(pid);
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Producto no encontrado' })
    }
});

router.post('/products', async (req, res) => {
    try {
        const product = await ProductsController.create(req.body)
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el producto' })
    }
});

router.put('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    const { body } = req;
    try {
        await ProductsController.updateById(pid, body);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: 'Error al intentar actualizar el producto' })
    }
});

router.delete('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        await ProductsController.deleteById(pid);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: 'Error al intentar eliminar el producto' })
    }
});

export default router;