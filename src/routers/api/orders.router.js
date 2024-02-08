import { Router } from 'express';
import passport from 'passport';

import OrdersController from '../../controllers/orders.controller.js';
import UsersService from '../../services/users.service.js';
import UserController from '../../controllers/users.controller.js';
import { isAdmin } from '../../../utils/utils.js';
import { logger } from '../../config/logger.js';


const router = Router();

router.get('/orders', isAdmin, async (req, res) => {
    try {
        const orders = await OrdersController.getAll({});
        logger.info('Orders loaded successfully')
        res.status(200).json(orders);
    } catch (error) {
        logger.error('Error 404: Page not found')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.get('/orders/current', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const { user } = req;
        const currentUser = await user.populate('orders');
        const orders = currentUser.orders;
        logger.info(`User orders: ${user.email}`)
        res.status(200).json(orders);
    } catch (error) {
        logger.error('Error 404: Page not found')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.post('/orders/current', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const { body, user } = req;
        const userId = user._id;
        const dataOrder = {body, user}
        const newOrder = await OrdersController.create(dataOrder);
        await UsersService.updateById(userId, { $push: { orders: newOrder._id }, $set: { cart: null } }, { new: true } );
        logger.info(`Order created successfully: ${newOrder._id}`)
        res.status(200).json(newOrder);
    } catch (error) {
        logger.error('Error 404: Page not found')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.delete('/orders/current', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const uid = req.user._id;
        await OrdersController.deleteAllOrders(uid)
        logger.info(`User orders deleted: ${uid}`)
        res.status(200).end();
    } catch (error) {
        logger.error('Error 404: Page not found')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.delete('/orders/current/:oid', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    const { oid } = req.params;
    const user = req.user;
    const userId = user._id;
    try {
        await OrdersController.deleteById(oid);
        const userOrders = user.orders;
        console.log("PRE", userOrders.length);
        await UserController.updateById(userId, {
            $pull: { orders: oid }
        });
        console.log("POST", userOrders.length);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: 'Error al intentar eliminar la orden' })
    }
})

export default router;


