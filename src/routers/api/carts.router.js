import { Router } from 'express';

import CartsController from '../../controllers/carts.controller.js';
import UserController from '../../controllers/users.controller.js';
import passport from 'passport';
import CartsService from '../../services/carts.service.js';
import OrdersService from '../../services/orders.service.js';
import EmailService from '../../services/email.service.js';
import TicketsController from '../../controllers/tickets.controller.js';

const router = Router();

router.get('/carts/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const currentUser = await UserController.getById(req.user)
        const userWithCart = await currentUser.populate('cart')
        res.status(200).json(userWithCart.cart);
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).json({ message: 'Error al obtener el carrito' });
    }
});

router.post('/carts/current/:pid', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { pid } = req.params;
        const cid = req.user.cart._id;
        const updatedCart = await CartsController.addProductToCart(cid, pid)
        res.status(200).json(updatedCart)
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.delete('/carts/current/:pid', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { pid } = req.params;
        const cid = req.user.cart._id;
        const newUpdatedCart = await CartsController.deleteProductById(cid, pid)
        res.status(200).json(newUpdatedCart)
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: error.message });
    }
});

/* router.put('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;
        const updatedCart = await CartsManager.updateCart(cid, products)
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}) */

router.delete('/carts/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const cid = req.user.cart._id.toString();
        const emptyCart = await CartsController.deleteAllProductsFromCart(cid)
        res.status(200).json(emptyCart);
    } catch (error) {
        res.status(500).send({ error: error.message });
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
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

router.get('/carts/current/purchase', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { user } = req;
        const productsRejected = await CartsController.cartPurchase(user)
        const finalizedPurchase = await TicketsController.create(user)

        const userEmail = user.email;
        const tickets = user.tickets;
        const currentTicket = tickets[tickets.length - 1]
        const userPopulatd = await user.populate('orders');
        const orders = userPopulatd.orders;
        const currentOrderPopulated = await orders[orders.length - 1].populate('products.product')
        const productsInOrder = currentOrderPopulated.products;

        let productOrder;

        for (let index = 0; index < productsInOrder.length; index++) {
            const element = productsInOrder[index];
            const product = element.product;
            const quantity = element.quantity
            productOrder = { product, quantity }            
        }
   
        const emailService = EmailService.getInstance();
        await emailService.sendEmail(
            userEmail,
            'Informacion de su compra',
            `<div>
            <ul>
                <li>Codigo: ${currentTicket.code}</li>
                <li>Productos:
                    <ul>
                        <li>${productOrder.quantity} x ${productOrder.product.title}</li>
                    </ul>
                </li>
                <li>Total: ${currentTicket.amount}</li>
            </ul>
            </div>`

        )
        res.status(200).json({productsRejected, finalizedPurchase})
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})


export default router;