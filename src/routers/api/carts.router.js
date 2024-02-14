import { Router } from 'express';

import CartsController from '../../controllers/carts.controller.js';
import UserController from '../../controllers/users.controller.js';
import passport from 'passport';
import EmailService from '../../services/email.service.js';
import TicketsController from '../../controllers/tickets.controller.js';
import { logger } from '../../config/logger.js';

const router = Router();

router.get('/carts/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const currentUser = await UserController.getById(req.user)
        logger.debug('UserController.getById() finished successfully')
        const userWithCart = await currentUser.populate('cart')
        logger.info(`Viewing user cart: ${currentUser.cart._id}`)
        res.status(200).json(userWithCart.cart);
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: GET. Path: /carts/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.post('/carts/current/:pid', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { pid } = req.params;
        const cid = req.user.cart._id;
        const updatedCart = await CartsController.addProductToCart(cid, pid)
        logger.debug('CartsController.addProductToCart() finished successfully')
        logger.info(`Product added to cart successfully: ${pid}`)
        res.status(200).json(updatedCart)
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: POST. Path: /carts/current/:pid')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.delete('/carts/current/:pid', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { pid } = req.params;
        const cid = req.user.cart._id;
        const newUpdatedCart = await CartsController.deleteProductById(cid, pid)
        logger.debug('CartsController.deleteProductById() finished successfully')
        logger.info(`Product removed from cart successfully: ${pid}`)
        res.status(200).json(newUpdatedCart)
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: DELETE. Path: /carts/current/:pid')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.delete('/carts/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const cid = req.user.cart._id.toString();
        const emptyCart = await CartsController.deleteAllProductsFromCart(cid)
        logger.debug('CartsController.deleteAllProductsFromCart() finished successfully')
        logger.info(`All products removed from cart successfully`)
        res.status(200).json(emptyCart);
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: DELETE. Path: /carts/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.put('/carts/current/product/:pid', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { pid } = req.params;
        const cid = req.user.cart._id; 
        const cart = await CartsController.getById(cid);
        logger.debug('CartsController.getById() finished successfully')
        let newQuantity;
        if (req.body.action === 'increase') {
            newQuantity = cart.products.find(item => item.product._id.toString() === pid.toString()).quantity + 1;
        } else if (req.body.action === 'decrease') {
            newQuantity = cart.products.find(item => item.product._id.toString() === pid.toString()).quantity - 1;
        } else {
            throw new Error('Acción no válida');
        }
        const updatedCart = await CartsController.updateOneProductQuantity(cid, pid, newQuantity);
        logger.debug('CartsController.updateOneProductQuantity() finished successfully');
        logger.info(`Product quantity successfully updated: ${pid}`);
        res.status(200).json(updatedCart);
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: DELETE. Path: /carts/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.get('/carts/current/purchase', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { user } = req;

        const productsRejected = await CartsController.cartPurchase(user._id);
        logger.debug('CartsController.cartPurchase() finished successfully')
        const finalizedPurchase = await TicketsController.create(user._id);
        logger.debug('TicketsController.create() finished successfully')

        const userEmail = user.email;

        const ticket = finalizedPurchase.ticketCreated;

        const userPopulatd = await user.populate('orders');
        const orders = userPopulatd.orders;
        const currentOrderPopulated = await orders[orders.length - 1].populate('products.product')
        const productsInOrder = currentOrderPopulated.products;

        const productsListItems = productsInOrder.map(product => {
            return `<li>${product.quantity} x ${product.product.title}</li>`;
        });
   
        const emailService = EmailService.getInstance();
        await emailService.sendEmail(
            'javidiuf@hotmail.com',
            'Informacion de su compra',
            `<div>
            <ul>
                <li>Codigo: ${ticket.code}</li>
                <li>Productos:
                    <ul>
                    ${productsListItems.join('')}
                    </ul>
                </li>
                <li>Total: $${ticket.amount}</li>
            </ul>
            </div>` 

        )
        logger.info('Successful purchase')
        res.status(200).json({productsRejected, finalizedPurchase})
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: DELETE. Path: /carts/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})


export default router;