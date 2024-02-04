import { Router } from 'express';
import passport from 'passport';

import OrdersController from '../../controllers/orders.controller.js';
import UsersService from '../../services/users.service.js';
import UserController from '../../controllers/users.controller.js';


const router = Router();

router.get('/orders', async (req, res, next) => {
    try {
        const orders = await OrdersController.getAll({});
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
})

router.get('/orders/current', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const { user } = req;
        const currentUser = await user.populate('orders');
        const orders = currentUser.orders;
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
})

router.post('/orders/current', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
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

router.delete('/orders/current', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const uid = req.user._id.toString();
        await OrdersController.deleteAllOrders(uid)
        res.status(200).end();
    } catch (error) {
        next(error);
    }
})

router.delete('/orders/current/:oid', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    const { oid } = req.params;
    const user = req.user;
    const userId = user._id.toString();
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

/* router.post('/current/:id/resolve', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const { body, params: { id } } = req;
        await OrdersController.resolve(id, body);
        res.status(201).end();
    } catch (error) {
        next(error);
    }
}) */

export default router;


