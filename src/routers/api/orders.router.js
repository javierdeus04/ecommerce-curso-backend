import { Router } from 'express';
import passport from 'passport';

import OrdersController from '../../controllers/orders.controller.js';
import UserController from '../../controllers/users.controller.js';
import { isAdmin } from '../../../utils/utils.js';
import { logger } from '../../config/logger.js';


const router = Router();

router.get('/orders', isAdmin, async (req, res) => {
    try {
        const orders = await OrdersController.getAll({});
        logger.debug('OrdersController.getAll() finished successfully')
        logger.info('Orders loaded successfully')
        res.status(200).json(orders);
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: GET. Path: /orders')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.get('/orders/current', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const { user } = req;
        if (!user || user.role === 'admin') {
            logger.error('User not found')
        }
        const currentUser = await user.populate('orders');
        const orders = currentUser.orders;
        logger.info(`Viewing user orders: ${user.email}`)
        res.status(200).json(orders);
    } catch (error) {
        logger.error('API Router Error. Method: GET. Path: /orders/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.post('/orders/current', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const { body, user } = req;
        if (!user || user.role === 'admin') {
            logger.error('User not found')
        }
        const userId = user._id;
        const dataOrder = { body, user }
        const newOrder = await OrdersController.create(dataOrder);
        logger.debug('OrdersController.create() finished successfully')
        await UserController.updateById(userId, { $push: { orders: newOrder._id }, $set: { cart: null } }, { new: true });
        logger.debug('UserController.updateById() finished successfully')
        logger.info(`Order created successfully: ${newOrder._id}`)
        res.status(200).json(newOrder);
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: POST. Path: /orders/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.delete('/orders/current', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const { user } = req;
        if (!user || user.role === 'admin') {
            logger.error('User not found')
        }
        const uid = user._id;
        await OrdersController.deleteAllOrders(uid)
        logger.debug('OrdersController.deleteAllOrders() finished successfully')
        logger.info(`User orders deleted: ${uid}`)
        res.status(200).end();
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: DELETE. Path: /orders/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.delete('/orders/current/:oid', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    const { oid } = req.params;
    const user = req.user;
    try {
        if (!user || user.role === 'admin') {
            logger.error('User not found')
            res.status(404).json({ message: 'Pagina no encontrada' })
        } else {
            await OrdersController.deleteById(oid);
            logger.debug('OrderController.deleteById() finished successfully')
            logger.debug(user.orders.length);
            await UserController.updateById(user._id, { $pull: { orders: oid } });
            logger.debug('UserController.updateById() finished successfully')
            logger.debug(user.orders.length);
            logger.info(`Order deleted: ${oid}`)
            res.status(204).end();
        }
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: DELETE. Path: /orders/current/:oid')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

export default router;


