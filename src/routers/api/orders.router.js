import { Router } from 'express';
import passport from 'passport';

import OrdersController from '../../controllers/orders.controller.js';
import UsersService from '../../services/users.service.js';

const router = Router();

router.get('/orders', async (req, res, next) => {
    try {
        const orders = await OrdersController.getAll({});
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
})

router.get('/current/orders', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const { user } = req;
        const orders = await OrdersController.getAll({ user });
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
})

router.post('/current/orders', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const { body, user } = req;
        const userId = user._id;
        const dataOrder = {body, user}
        const newOrder = await OrdersController.create(dataOrder);
        await UsersService.updateById(userId, { $push: { orders: newOrder._id }, $set: { cart: null } }, { new: true } );
        res.status(200).json(newOrder);
    } catch (error) {
        next(error);
    }
})

router.post('/current/:id/resolve', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const { body, params: { id } } = req;
        await OrdersController.resolve(id, body);
        res.status(201).end();
    } catch (error) {
        next(error);
    }
})

export default router;


