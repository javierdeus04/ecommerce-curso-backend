import { Router } from 'express';
import passport from 'passport';

import ProductsController from '../../controllers/products.controller.js';
import UserController from '../../controllers/users.controller.js';
import { isAdmin, isAdminOrPremium, isPremium, uploadProduct, IMAGE_URL_BASE } from '../../../utils/utils.js';
import { logger } from '../../config/logger.js';
import EmailService from '../../services/email.service.js';

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

router.post('/products', passport.authenticate('jwt', { session: false }), isAdminOrPremium, uploadProduct.single('thumbnail'), async (req, res) => {
    try {
        const { body, user } = req;
        const ownerId = user.role === 'admin' ? 'admin' : user._id;
        const thumbnail = {
            name: req.file.originalname,
            reference: `${IMAGE_URL_BASE}/products/${req.file.filename}`,
        };
        const product = await ProductsController.create(body, ownerId, thumbnail);
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
        const product = await ProductsController.getById(pid);
        logger.debug('ProductsController.getById() finished successfully');

        if (!product) {
            return res.status(400).json({ message: 'No se encontró el producto' });
        }

        const productOwner = product.owner;
        const isProductOwnedByAdmin = productOwner === 'admin';

        if (!productOwner || isProductOwnedByAdmin) {
            await ProductsController.deleteById(pid);
            logger.info(`Product successfully removed: ${pid}`);
            return res.status(204).json({ message: 'Product deleted' });
        }

        try {
            const user = await UserController.getById(productOwner);
            if (!user) {
                await ProductsController.deleteById(pid);
                logger.info(`Product successfully removed: ${pid}`);
                return res.status(204).json({ message: 'Product deleted' });
            }
        } catch (error) {
            await ProductsController.deleteById(pid);
            logger.debug('ProductsController.deleteById() finished successfully');
            logger.info(`Product successfully removed: ${pid}`);
            return res.status(204).json({ message: 'Product deleted' });
        }

        const userEmail = user.email;

        const emailService = EmailService.getInstance();
        await emailService.sendEmail(
            'javier.deus04@gmail.com',
            'MoviEcommerce',
            `<div>
                <h1>Producto dado de baja</h1>
                <p>El producto ${product.title} ha sido eliminado de la plataforma. Por cualquier duda, contáctenos.</p>
            </div>`
        );

        await ProductsController.deleteById(pid);
        logger.info(`Product successfully removed: ${pid}`);
        return res.status(204).json({ message: 'Product deleted' });

    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: DELETE. Path: /products/:pid');
        return res.status(404).json({ message: 'Página no encontrada' });
    }
});

router.delete('/premium/products/:pid', passport.authenticate('jwt', { session: false }), isPremium, async (req, res) => {
    const { pid } = req.params;
    const uid = req.user._id;
    try {
        const product = await ProductsController.getById(pid);
        logger.debug('ProductsController.getById() finished successfully');

        if (!product) {
            return res.status(400).json({ message: 'No se encontró el producto' });
        }

        if (product.owner !== uid.toString()) {
            return res.status(400).json({ message: "Error al intentar borrar producto"});
        }

        const userEmail = req.user.email;

        const emailService = EmailService.getInstance();
        await emailService.sendEmail(
            'javier.deus04@gmail.com',
            'MoviEcommerce',
            `<div>
                <h1>Producto dado de baja</h1>
                <p>El producto ${product.title} ha sido eliminado de la plataforma de forma correcta.</p>
            </div>`
        );

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