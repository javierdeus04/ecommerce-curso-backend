import { Router } from 'express';
import passport from 'passport';

import { isAdmin } from '../../../utils/utils.js';
import { logger } from '../../config/logger.js';
import TicketsController from '../../controllers/tickets.controller.js';
import UsersService from '../../services/users.service.js';


const router = Router();

router.get('/tickets', isAdmin, async (req, res) => {
    try {
        const tickets = await TicketsController.getAll({});
        logger.debug('TicketsController.getAll() finished successfully')
        logger.info('Tickets loaded successfully')
        res.status(200).json(tickets);
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: GET. Path: /tickets')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.get('/tickets/current', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const { user } = req;
        if (!user || user.role === 'admin') {
            logger.error(`User not found`)
            throw new Error('User not found')
        }
        const tickets = user.tickets;
        logger.debug(tickets.length)
        logger.info(`Viewing user tickets: ${user.email}`)
        res.status(200).json(tickets);
    } catch (error) {
        logger.error(error.message)
        logger.error('API Router Error. Method: GET. Path: /tickets/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})


router.delete('/orders/tickets', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const { user } = req;
        if (!user || user.role === 'admin') {
            logger.error(`User not found`)
            throw new Error('User not found')
        }
        const uid = user._id;
        await TicketsController.deleteAllTickets(uid)
        logger.debug('TicketsController.deleteAllOrders() finished successfully')
        logger.info(`User tickets deleted: ${uid}`)
        res.status(200).end();
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: DELETE. Path: /tickets/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.delete('/tickets/current/:tc', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    const { tc } = req.params;
    const user = req.user;
    try {
        if (!user || user.role === 'admin') {
            logger.error(`User not found`)
            throw new Error('User not found')
        } else {
            await TicketsController.deleteByCode(tc);
            logger.debug('TicketsController.deleteByCode() finished successfully')
            logger.debug(user.tickets.length);
            await UsersService.updateById(user._id, { $pull: { tickets: tc } });
            logger.debug('UserController.updateById() finished successfully')
            logger.debug(user.tickets.length);
            logger.info(`Ticket deleted: ${tc}`)
            res.status(204).end();
        }
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: DELETE. Path: /tickets/current/:tc')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

export default router;