import { Router } from 'express';

import CartsController from '../../controllers/carts.controller.js';
import UserController from '../../controllers/users.controller.js';
import passport from 'passport';
import CartsService from '../../services/carts.service.js';
import OrdersService from '../../services/orders.service.js';
import EmailService from '../../services/email.service.js';
import TicketsController from '../../controllers/tickets.controller.js';
import { logger } from '../../config/logger.js';

const router = Router();

router.get('/carts/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const currentUser = await UserController.getById(req.user)
        const userWithCart = await currentUser.populate('cart')
        logger.info(`Viewing user cart: ${currentUser.cart._id}`)
        res.status(200).json(userWithCart.cart);
    } catch (error) {
        logger.error('Error 404: Page not found')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.post('/carts/current/:pid', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { pid } = req.params;
        const cid = req.user.cart._id;
        const updatedCart = await CartsController.addProductToCart(cid, pid)
        logger.info(`Product added to cart successfully: ${pid}`)
        res.status(200).json(updatedCart)
    } catch (error) {
        logger.error('Error 404: Page not found')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.delete('/carts/current/:pid', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { pid } = req.params;
        const cid = req.user.cart._id;
        const newUpdatedCart = await CartsController.deleteProductById(cid, pid)
        logger.info(`Product removed from cart successfully: ${pid}`)
        res.status(200).json(newUpdatedCart)
    } catch (error) {
        logger.error('Error 404: Page not found')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.delete('/carts/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const cid = req.user.cart._id.toString();
        const emptyCart = await CartsController.deleteAllProductsFromCart(cid)
        logger.info(`All products removed from cart successfully`)
        res.status(200).json(emptyCart);
    } catch (error) {
        logger.error('Error 404: Page not found')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.put('/carts/current/product/:pid', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { pid } = req.params;
        const cid = req.user.cart._id; 
        const cart = await CartsService.getById(cid);
        const quantity = cart.products.find(item => item.product._id.toString() === pid.toString()).quantity;
        const decreaseQuantity = quantity - 1;
        const updatedCart = await CartsService.updateOneProductQuantity(cid, pid, decreaseQuantity);
        logger.info(`Product unit successfully removed from cart: ${pid}`)
        res.status(200).json(updatedCart);
    } catch (error) {
        logger.error('Error 404: Page not found')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.put('/carts/current/product/:pid', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { pid } = req.params;
        const cid = req.user.cart._id; 
        const cart = await CartsService.getById(cid);
        const quantity = cart.products.find(item => item.product._id.toString() === pid.toString()).quantity;
        const increaseQuantity = quantity + 1;
        const updatedCart = await CartsService.updateOneProductQuantity(cid, pid, increaseQuantity);
        logger.info(`Product unit successfully added to cart: ${pid}`)
        res.status(200).json(updatedCart);
    } catch (error) {
        logger.error('Error 404: Page not found')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.get('/carts/current/purchase', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { user } = req;

        const productsRejected = await CartsController.cartPurchase(user._id);
        const finalizedPurchase = await TicketsController.create(user._id);

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
            userEmail,
            'Informacion de su compra',
            `<div>
            <ul>
                <li>Codigo: ${ticket.code}</li>
                <li>Productos:
                    <ul>
                    ${productsListItems.join('')}
                    </ul>
                </li>
                <li>Total: ${ticket.amount}</li>
            </ul>
            </div>` 

        )
        logger.debug('Router /carts/current/purchase finalized successfully')
        res.status(200).json({productsRejected, finalizedPurchase})
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})


export default router;